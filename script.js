function setupCalculator(buttonId, fileInputId, dateInputId, nicknameInputId, resultDivId, resultsOutputId, downloadButtonId) {
    document.getElementById(buttonId).addEventListener('click', function() {
        const fileInput = document.getElementById(fileInputId);
        const nicknameInput = document.getElementById(nicknameInputId).value.trim().split('\n');
        const dateInput = document.getElementById(dateInputId).value;
        const resultDiv = document.getElementById(resultDivId);
        const resultsOutput = document.getElementById(resultsOutputId);
        const downloadButton = document.getElementById(downloadButtonId);

        if (!fileInput.files.length) {
            alert("파일을 업로드해주세요.");
            return;
        }

        if (!dateInput) {
            alert("날짜를 입력해주세요.");
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const content = event.target.result; // event 객체의 target 사용
            const lines = content.split('\n');
            const results = {};

            nicknameInput.forEach(nickname => {
                results[nickname] = {
                    countIncluding: 0,
                    countExcluding: 0
                };
            });

            let dateFound = false;

            lines.forEach(line => {
                const dateMatch = line.match(/--------------- (.*?) ---------------/);
                
                if (dateMatch) {
                    dateFound = (dateMatch[1] === formatDate(dateInput));
                }

                if (dateFound) {
                    const nicknameMatch = line.match(/\[(.*?)\]/g);
                    if (nicknameMatch) {
                        const nickname = nicknameMatch[0].replace(/\[|\]/g, '');
                        const time = nicknameMatch[1].replace(/\[|\]/g, '');

                        const timeValue = parseTime(time);

                        if (results[nickname] !== undefined) {
                            results[nickname].countIncluding++;

                            if (!(timeValue >= 11 * 60 + 55 && timeValue <= 12 * 60 + 20) && 
                                !(timeValue >= 17 * 60 + 55 && timeValue <= 18 * 60 + 20)) {
                                results[nickname].countExcluding++;
                            }
                        }
                    }
                }
            });

            resultsOutput.innerHTML = '';
            let csvContent = "닉네임,리딩 포함,리딩 미포함\n";

            nicknameInput.forEach(nickname => {
                const trimmedNickname = nickname.trim();
                if (trimmedNickname) {
                    const result = results[trimmedNickname];
                    resultsOutput.innerHTML += `
                        <tr>
                            <td>${trimmedNickname}</td>
                            <td>${result.countIncluding}</td>
                            <td>${result.countExcluding}</td>
                        </tr>
                    `;
                    csvContent += `${trimmedNickname},${result.countIncluding},${result.countExcluding}\n`;
                }
            });

            resultDiv.classList.remove('hidden');
            downloadButton.classList.remove('hidden');

            downloadButton.onclick = function() {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'results.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
        };

        reader.readAsText(file);
    });
}

// 시간을 분으로 변환하는 함수
function parseTime(timeStr) {
    const [period, time] = timeStr.split(' ');
    let [hour, minute] = time.split(':').map(Number);

    if (period === '오후' && hour < 12) {
        hour += 12;
    }
    if (period === '오전' && hour === 12) {
        hour = 0;
    }

    return hour * 60 + minute; // 총 분으로 반환
}

// 날짜 형식을 변환하는 함수
function formatDate(dateInput) {
    const date = new Date(dateInput);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

// 페이지 로드 시 오늘 날짜 자동 설정
function setTodayDate(inputId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    document.getElementById(inputId).value = formattedDate;
}

// 페이지 로드 시 오늘 날짜 설정
window.onload = function() {
    setTodayDate('dateInput1');
    setTodayDate('dateInput2');
    
    setupCalculator('searchButton1', 'fileInput1', 'dateInput1', 'nicknameInput1', 'result1', 'resultsOutput1', 'downloadButton1');
    setupCalculator('searchButton2', 'fileInput2', 'dateInput2', 'nicknameInput2', 'result2', 'resultsOutput2', 'downloadButton2');
};
