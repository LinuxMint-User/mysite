document.addEventListener('DOMContentLoaded', () => {

    const apkWorker = new Worker('js/workers/apk-parser-worker.js');

    const dropArea = document.getElementById('dropArea');
    const selectBtn = document.getElementById('selectBtn');
    const copySignatureBtn = document.getElementById('copySignature');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.apk';
    
    // 拖放功能实现
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    dropArea.addEventListener('drop', handleDrop, false);
    selectBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFiles);
    copySignatureBtn.addEventListener('click', copySignature);

    // 修改handleDrop函数
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            e.preventDefault();  // 阻止浏览器默认下载行为
            handleFiles({ target: { files } });
        }
    }

    async function handleFiles(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.apk')) {
            alert('请选择有效的APK文件');
            return;
        }

        dropArea.querySelector('p').textContent = file.name;
        dropArea.classList.add('highlight');
        
        callBanner("正在解析 APK 文件");
        
        try {
            // 读取文件为ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            // 传输ArrayBuffer和文件名
            apkWorker.postMessage({
                buffer: arrayBuffer,
                fileName: file.name
            }, [arrayBuffer]);
        } catch (e) {
            console.error('文件读取失败:', e);
            alert('文件读取失败: ' + e.message);
            resetUI();
        }
    }
    
    // 添加Worker消息处理
    apkWorker.onmessage = function(e) {
        // console.log('Worker返回结果:', e.data);
        
        if (e.data.error) {
            console.error('Worker解析错误:', e.data.error);
            callBanner('解析失败: ' + e.data.error);
            resetUI();
            return;
        }

        const { result, extraInfo } = e.data;
        updateUIWithResult(result, extraInfo);
        callBanner("APK 文件解析完成");
    };

    apkWorker.onerror = function(e) {
        console.error('Worker解析错误:', e);
        callBanner('解析失败: ' + e.message);
        resetUI();
    };

    function updateUIWithResult(result, extraInfo) {

        // 确保result和extraInfo存在
        if (!result || !extraInfo) {
            throw new Error('解析结果数据不完整');
        }

        // 合并架构信息
        const allArchitectures = [
            ...(result.nativeCode || []),
            ...extraInfo.architectures
        ].filter((v, i, a) => a.indexOf(v) === i); // 去重
            
        // 更新基本信息 - 确保字段名正确
        updateField('package', result.package);
        updateField('version', result.versionName);
        updateField('version_code', result.versionCode);
        
        // 更新SDK信息 - 添加备用字段名检查
        updateField('min_sdk', result.usesSdk.minSdkVersion);
        updateField('target_sdk', result.usesSdk.targetSdkVersion);
        
        // 更新架构显示
        const archContent = document.getElementById('archContent');
        if (allArchitectures.length > 0) {
            archContent.innerHTML = allArchitectures
                .map(arch => `• ${arch}`)
                .join('<br>');
        } else {
            archContent.textContent = '未检测到原生库';
        }
        
        // 更新签名信息
        const signatureContent = document.getElementById('signatureContent');
        if (extraInfo.signatureDetails && extraInfo.signatureDetails.signatureHex) {
            signatureContent.textContent = extraInfo.signatureDetails.signatureHex.toUpperCase();
        } else {
            signatureContent.textContent = '未检测到签名';
        }
        
        // 更新权限列表 - 检查不同可能的权限字段
        // 更新权限列表 - 修改为处理 usesPermissions 数组
        const permissionContent = document.getElementById('permissionContent');
        const permissions = result.usesPermissions || result.permissions || result.manifest?.usesPermissions;
        permissionContent.innerHTML = '';
        
        if (permissions && permissions.length > 0) {
            // 先过滤掉空白权限项，然后排序
            const validPermissions = permissions.filter(perm => {
                const name = typeof perm === 'string' ? perm : perm.name;
                return name && name.trim() !== '';
            });
            
            validPermissions.sort((a, b) => {
                const nameA = typeof a === 'string' ? a : a.name;
                const nameB = typeof b === 'string' ? b : b.name;
                return nameA.localeCompare(nameB);
            });
        
            validPermissions.forEach(perm => {
                const permEl = document.createElement('div');
                permEl.className = 'permission-item';
                // 处理带 maxSdkVersion 的权限
                const permText = perm.maxSdkVersion 
                    ? `• ${perm.name} (maxSdkVersion: ${perm.maxSdkVersion})`
                    : `• ${perm.name}`;
                permEl.textContent = permText;
                permissionContent.appendChild(permEl);
            });
        
            if (validPermissions.length === 0) {
                const noPerms = document.createElement('div');
                noPerms.className = 'no-permissions';
                noPerms.textContent = '未检测到特殊权限';
                permissionContent.appendChild(noPerms);
            }
        } else {
            const noPerms = document.createElement('div');
            noPerms.className = 'no-permissions';
            noPerms.textContent = '未检测到特殊权限';
            permissionContent.appendChild(noPerms);
        }
    }

    function updateField(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || '未知';
            element.style.color = value === '未知' ? '#e67e22' : '';
        }
    }

    function copySignature() {
        const signatureContent = document.getElementById('signatureContent');
        const copyBtn = document.getElementById('copySignature');
        const originalText = copyBtn.textContent;
        
        navigator.clipboard.writeText(signatureContent.textContent)
            .then(() => {
                // 修改按钮文字为"已复制"
                copyBtn.textContent = '已复制';
                
                // 2秒后恢复原状
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                copyBtn.textContent = '复制失败';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
    }

    function resetUI() {
        dropArea.querySelector('p').textContent = '拖放APK文件到此区域\n或点击下方按钮选择文件';
        dropArea.classList.remove('highlight');
        
        ['package', 'version', 'version_code', 'min_sdk', 'target_sdk'].forEach(id => {
            updateField(id, '');
        });
        
        document.getElementById('archContent').textContent = '等待解析...';
        document.getElementById('signatureContent').textContent = '等待解析...';
        
        const permissionContent = document.getElementById('permissionContent');
        permissionContent.innerHTML = '';
        const noPerms = document.createElement('div');
        noPerms.className = 'no-permissions';
        noPerms.textContent = '未检测到特殊权限';
        permissionContent.appendChild(noPerms);
    }
});