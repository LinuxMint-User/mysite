// 在顶部添加模拟window对象
self.window = self;

self.importScripts('../jszip.min.js', '../app-info-parser.min.js', '../apk-extra-info.js');

// 确保库已正确加载
if (typeof AppInfoParser === 'undefined') {
    throw new Error('APK解析库未加载');
}

self.onmessage = async function (e) {
    try {
        const { buffer, fileName } = e.data;
        
        // 将ArrayBuffer转换回File对象
        const file = new File([buffer], fileName, { type: 'application/vnd.android.package-archive' });

        const parser = new AppInfoParser(file);
        const result = await parser.parse();

        const extraParser = new APKExtraInfoParser(file);
        const extraInfo = await extraParser.parse();

        // 返回结果
        self.postMessage({
            result: {
                package: result.package,
                versionName: result.versionName,
                versionCode: result.versionCode,
                usesSdk: result.usesSdk || { minSdkVersion: null, targetSdkVersion: null },
                nativeCode: result.nativeCode || [],
                usesPermissions: result.usesPermissions || []
            },
            extraInfo: {
                architectures: extraInfo.architectures || [],
                signatureDetails: extraInfo.signatureDetails || null
            }
        });
    } catch (e) {
        console.error('Worker解析错误:', e);
        self.postMessage({ error: e.message });
    }
};