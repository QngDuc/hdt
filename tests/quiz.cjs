const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    filename,
  );
const {
  createAttempt,
  grade,
  remainingSeconds,
} = require("../src/quiz/logic.ts");
for (const topic of ["Toán học", "Tin học"]) {
  for (let i = 0; i < 100; i++) {
    const a = createAttempt(topic, { name: "Test", code: "TEST" }, 1000);
    assert.equal(a.questions.length, 5);
    assert.equal(new Set(a.questions.map((q) => q.id)).size, 5);
    assert.ok(
      a.questions.every((q) => q.topic === topic && q.options.length === 4),
    );
    assert.equal(remainingSeconds(a, 61000), 120);
    assert.equal(remainingSeconds(a, 999999), 0);
    assert.equal(grade(a, 999999).usedSeconds, 180);
    assert.equal(grade(a).unansweredCount, 5);
    for (const q of a.questions) a.answers[q.id] = q.correct;
    assert.equal(grade(a, 61000).score, 10);
    a.answers[a.questions[0].id] = (a.questions[0].correct + 1) % 4;
    delete a.answers[a.questions[1].id];
    const r = grade(a, 61000);
    assert.equal(r.score, 6);
    assert.equal(r.correctCount, 3);
    assert.equal(r.wrongCount, 1);
    assert.equal(r.unansweredCount, 1);
    assert.equal(r.usedSeconds, 60);
    assert.equal(remainingSeconds(JSON.parse(JSON.stringify(a)), 121000), 60);
  }
}
console.log("PASS: 200 lượt chọn câu, chấm điểm và khôi phục thời hạn.");
