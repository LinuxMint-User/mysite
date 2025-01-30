function extractChecksum(content) {
    // 假设校验文件的格式为 "文件名 校验值" 或 "校验值 文件名"
    const lines = content.split('\n');
    for (let line of lines) {
        const parts = line.split(/\s+/);
        for (let part of parts) {
            if (isHex(part)) {
                return part;
            }
        }
    }
    return null;
}

function isHex(str) {
    return /^[0-9a-fA-F]+$/.test(str);
}

function calculateChecksum(file, checksumType, checksum) {
    return new Promise((resolve, reject) => {
        let hashAlgorithm;
        if (checksumType === 'auto') {
            hashAlgorithm = detectChecksumType(checksum);
            if (!hashAlgorithm) {
                reject(new Error("无法自动检测校验值类型"));
                return;
            }
        } else {
            hashAlgorithm = {
                "MD5": CryptoJS.algo.MD5,
                "SHA1": CryptoJS.algo.SHA1,
                "SHA256": CryptoJS.algo.SHA256,
                "SHA384": CryptoJS.algo.SHA384,
                "SHA512": CryptoJS.algo.SHA512
            }[checksumType.toUpperCase()];
        }

        if (!hashAlgorithm) {
            reject(new Error("不支持的校验类型"));
            return;
        }

        const chunkSize = 1024 * 1024; // 1MB
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        let hash = hashAlgorithm.create();

        function readChunk() {
            const reader = new FileReader();
            reader.onload = function (e) {
                hash.update(CryptoJS.lib.WordArray.create(new Uint8Array(e.target.result)));
                currentChunk++;
                if (currentChunk < chunks) {
                    readChunk();
                } else {
                    const calculatedChecksum = hash.finalize().toString();
                    resolve(calculatedChecksum);
                }
            };
            reader.onerror = function (e) {
                reject(new Error('读取文件时出错：' + e.target.error.message));
            };
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            reader.readAsArrayBuffer(file.slice(start, end));
        }

        readChunk();
    });
}

function detectChecksumType(checksum) {
    const length = checksum.length;
    if (length === 32) {
        return CryptoJS.algo.MD5;
    } else if (length === 40) {
        return CryptoJS.algo.SHA1;
    } else if (length === 64) {
        return CryptoJS.algo.SHA256;
    } else if (length === 96) {
        return CryptoJS.algo.SHA384;
    } else if (length === 128) {
        return CryptoJS.algo.SHA512;
    }
    return null;
}

function clearResult() {
    const resultLabel = document.getElementById('result-label');
    resultLabel.innerText = '校验结果：未校验';
    resultLabel.style.color = 'wheat';
}