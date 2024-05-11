function createButton(fileName) {
	const button = document.createElement('button');
	button.type = "button"
	button.textContent = fileName;
	button.dataset.filename = fileName; // 存储文件名作为自定义数据属性  
	button.dataset.fileContent = "";
	button.onclick = function () {
		const container = document.querySelector('.source-code');
		// const footer = document.querySelector('footer');
		// 添加隐藏类来触发过渡效果  
		container.classList.add('hidden');
		// footer.classList.add('hidden');  
		// 监听过渡结束事件  
		container.addEventListener('transitionend', function handler() {
			// 移除隐藏类和过渡结束事件监听器  
			container.classList.remove('hidden');
			container.removeEventListener('transitionend', handler);
			// 添加新内容
			loadCode(button);

		}, { once: true }); // 使用{ once: true }来确保事件只触发一次  

		// footer.addEventListener('transitionend', function handler() {  
		// 	// 移除隐藏类和过渡结束事件监听器  
		// 	footer.classList.remove('hidden');  
		// 	footer.removeEventListener('transitionend', handler);  
		// }, { once: true }); // 使用{ once: true }来确保事件只触发一次  


	};
	return button;
}

let currentFile = ''; // 用于跟踪当前显示的文件  

function loadCode(button) {
	const fileName = button.dataset.filename;
	if (currentFile === fileName) {
		// 如果已经是当前文件，则不执行任何操作  
		return;
	}

	// 显示加载中的提示  
	document.getElementById('code').textContent = '加载中...';

	// 更新当前文件提示
	document.getElementById('currentfile').textContent = "";

	if (button.dataset.fileContent != '') {
		// 判断文件格式
		var fileType = button.textContent.split('.').pop().toLowerCase().replace(/\r/g, "");
		const fileTypes = {
			'js': 'javascript',
			'css': 'css',
			'html': 'html',
			// 更多
		};
		const lang = fileTypes[fileType] || 'none';
		// 更新页面上的代码显示  
		document.getElementById('code').textContent = button.dataset.fileContent;
		document.getElementById('code').className = "";
		document.getElementById('code').classList.add('language-' + lang);
		// 加载渲染脚本  
		loadScript();
		// 更新当前文件提示
		document.getElementById('currentfile').textContent = button.textContent;
		// 更新当前文件跟踪变量  
		currentFile = fileName;
	} else {
		// 使用fetch加载文件内容  
		fetch(`sourceCode/${from}/${fileName}.txt`)
			.then(response => response.text())
			.then(code => {
				// 提取第一行作为文件名  
				const firstLine = code.split('\n')[0];
				// 判断文件格式
				var fileType = firstLine.split('.').pop().toLowerCase().replace(/\r/g, "");
				const fileTypes = {
					'js': 'javascript',
					'css': 'css',
					'html': 'html',
					// 更多
				};
				const lang = fileTypes[fileType] || 'none';
				// 去除第一行
				const content = code.split('\n').slice(1);
				const withoutFirstLine = content.join('\n');
				const output = withoutFirstLine;
				// 更新页面上的代码显示  
				document.getElementById('code').textContent = output;
				document.getElementById('code').className = "";
				document.getElementById('code').classList.add('language-' + lang);
				// 加载渲染脚本  
				loadScript();
				// 更新按钮的文本为提取的文件名  
				button.textContent = firstLine;
				// 更新当前文件提示
				document.getElementById('currentfile').textContent = button.textContent;
				//更新按钮的dataset
				button.dataset.fileContent = output;
				// 更新当前文件跟踪变量  
				currentFile = fileName;
			})
			.catch(error => {
				// 显示错误消息  
				document.getElementById('code').textContent = '加载文件失败';
				console.error('Error fetching the source code:', error);
			});
	}
	// 加载脚本的函数  
	function loadScript() {
		var script = document.createElement('script');
		script.src = 'js/sourceCode/prism-1.29.0.js';
		script.async = true; // 设置为异步加载  
		document.body.appendChild(script);
	}
}

function updateButtons(fileCount) {
	const buttonList = document.getElementById('button-list');
	// 清除现有的按钮  
	buttonList.innerHTML = '';

	// 根据fileCount创建新的按钮  
	for (let i = 1; i <= fileCount; i++) {
		const button = createButton(`file${i}`);
		buttonList.appendChild(button);
	}
}

// 解析URL参数  
const urlParams = new URLSearchParams(window.location.search);
const from = urlParams.get('from');

// 假设有一个映射关系，根据from的值决定要显示的文件数量  
const fileCounts = {
	'2048': 5,
	'2048-remastered': 4,
	// 可以添加更多映射关系  
};

let fileCount = fileCounts[from] || 0; // 如果没有匹配的from值，则默认显示0个按钮  

// 调用函数更新按钮个数  
updateButtons(fileCount);

// 加载默认文件（如果有默认文件的话）  
if (fileCount > 0) {
	// loadCode(`file1`);  
	document.getElementById('code').textContent = fileCount + " file(s) total.\n" + "Click to load and the filename will be updated.";
}  
