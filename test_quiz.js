const test = async () => {
    const res = await fetch("http://localhost:5085/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test_student@example.com", password: "password123" })
    });
    const d = await res.json();

    const answers = { "6": "B", "7": "A", "8": "C", "9": "C", "10": "A" };
    const res2 = await fetch("http://localhost:5085/api/results/submit/4", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + d.token },
        body: JSON.stringify(answers)
    });
    const data = await res2.json();
    console.log("Score:", data.score, "/", data.total);
    console.log("PassRate:", data.passRate);
    if (data.questions) {
        data.questions.forEach(q => {
            console.log(`  Q${q.questionId}: correct='${q.correctAnswer}' student='${q.studentAnswer}' isCorrect=${q.isCorrect}`);
        });
    }
};
test().catch(console.error);
