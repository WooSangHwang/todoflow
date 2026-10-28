// coverage/coverage-summary.json(vitest json-summary 리포터)을 GitHub 실행 결과용 마크다운 표로 바꾼다.
import { existsSync, readFileSync } from 'node:fs'

const file = 'coverage/coverage-summary.json'
if (!existsSync(file)) {
  console.log('### 커버리지\n\n커버리지 파일이 없습니다(테스트가 중간에 실패했을 수 있습니다).')
  process.exit(0)
}

const { total } = JSON.parse(readFileSync(file, 'utf8'))
const row = (label, key) => `| ${label} | ${total[key].pct}% | ${total[key].covered} / ${total[key].total} |`
console.log(
  [
    '### 커버리지',
    '',
    '| 항목 | 비율 | 커버 / 전체 |',
    '| --- | ---: | ---: |',
    row('구문', 'statements'),
    row('분기', 'branches'),
    row('함수', 'functions'),
    row('줄', 'lines'),
  ].join('\n'),
)
