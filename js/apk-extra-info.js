/**
 * APK额外信息解析器
 * 补充解析app-info-parser未提供的架构和签名信息
 */

class APKExtraInfoParser {
    constructor(file) {
        this.file = file;
    }

    async parse() {
        const extraInfo = {
            architectures: [],
            signatureDetails: null
        };

        try {
            // 使用JSZip解压APK文件
            const zip = await JSZip.loadAsync(this.file);
            
            // 解析支持的CPU架构
            await this._parseArchitectures(zip, extraInfo);
            
            // 解析签名信息
            await this._parseSignature(zip, extraInfo);
            
        } catch (e) {
            console.error('APK额外信息解析错误:', e);
        }
        
        return extraInfo;
    }

    async _parseArchitectures(zip, extraInfo) {
        // 查找lib目录下的子目录
        const libPrefix = 'lib/';
        const abiFolders = new Set();
        
        // 遍历所有文件，查找lib/下的子目录
        Object.keys(zip.files).forEach(relativePath => {
            if (relativePath.startsWith(libPrefix)) {
                const parts = relativePath.split('/');
                // 确保是lib的直接子目录 (如lib/armeabi-v7a/)
                if (parts.length >= 2 && parts[0] === 'lib' && parts[1]) {
                    abiFolders.add(parts[1]);
                }
            }
        });

        // console.log('检测到的ABI文件夹:', Array.from(abiFolders));

        // 常见的ABI架构映射
        const abiMap = {
            'armeabi': 'ARM v5',
            'armeabi-v7a': 'ARM v7', 
            'arm64-v8a': 'ARM64 v8',
            'x86': 'x86',
            'x86_64': 'x86_64',
            'mips': 'MIPS',
            'mips64': 'MIPS64'
        };

        extraInfo.architectures = Array.from(abiFolders)
            .map(folder => abiMap[folder] || folder)
            .filter(Boolean);
            
        // console.log('解析后的架构:', extraInfo.architectures);
    }

    async _parseSignature(zip, extraInfo) {
        // 检查META-INF目录下的签名文件
        const metaInfFolder = zip.folder('META-INF');
        if (metaInfFolder) {
            const signatureFiles = [];
            let signatureHex = '';
            
            // 查找.RSA或.DSA签名文件
            for (const [relativePath, file] of Object.entries(metaInfFolder.files)) {
                if (file.dir) continue;
                
                const ext = relativePath.split('.').pop().toUpperCase();
                if (['RSA', 'DSA', 'EC'].includes(ext)) {
                    signatureFiles.push(relativePath);
                    signatureHex += await this._processSignatureFile(file, relativePath);
                }
            }

            if (signatureFiles.length > 0) {
                extraInfo.signatureDetails = {
                    signatureFiles,
                    signatureHex: signatureHex || '无法解析签名内容'
                };
            } else {
                // 没有找到签名文件的情况
                extraInfo.signatureDetails = {
                    signatureFiles: [],
                    signatureHex: '未找到签名文件'
                };
            }
        } else {
            // 没有META-INF目录的情况
            extraInfo.signatureDetails = {
                signatureFiles: [],
                signatureHex: '未找到签名目录(META-INF)'
            };
        }
    }

    async _processSignatureFile(file, relativePath) {
        try {
            const content = await file.async('uint8array');
            let hexStr = '';
            const chunkSize = 1024;
            
            // 分块处理签名内容
            for (let i = 0; i < content.length; i += chunkSize) {
                const chunk = content.slice(i, i + chunkSize);
                for (let j = 0; j < chunk.length; j++) {
                    hexStr += chunk[j].toString(16).padStart(2, '0');
                    if ((j + 1) % 16 === 0) hexStr += '\n';
                    else hexStr += ' ';
                }
            }
            
            return hexStr;
        } catch (e) {
            console.error(`读取签名文件${relativePath}失败:`, e);
            return '解析签名失败';
        }
    }
}

// 使用方法示例
/*
const parser = new APKExtraInfoParser(apkFile);
const extraInfo = await parser.parse();
console.log('额外架构信息:', extraInfo.architectures);
console.log('签名文件:', extraInfo.signatureDetails);
*/