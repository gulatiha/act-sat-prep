'use strict';

const QUESTIONS = [
  // ── SAT MATH ──────────────────────────────────────────────────────────────
  { id:1, testType:"SAT", section:"Math", topic:"Linear Equations", difficulty:"easy",
    question:"If 3x + 9 = 24, what is the value of x?",
    options:["A) 3","B) 5","C) 7","D) 11"], correct:"B",
    explanation:"Subtract 9 from both sides: 3x = 15. Divide by 3: x = 5." },

  { id:2, testType:"SAT", section:"Math", topic:"Linear Equations", difficulty:"medium",
    question:"If 4(x − 2) = 2(x + 6), what is x?",
    options:["A) 4","B) 8","C) 10","D) 14"], correct:"C",
    explanation:"Expand: 4x − 8 = 2x + 12. Subtract 2x and add 8: 2x = 20, x = 10." },

  { id:3, testType:"SAT", section:"Math", topic:"Linear Equations", difficulty:"medium",
    question:"A line passes through (0, 3) and (4, 11). Which equation represents it?",
    options:["A) y = 2x + 3","B) y = 3x + 2","C) y = x + 7","D) y = 2x − 3"], correct:"A",
    explanation:"Slope = (11−3)/(4−0) = 2. y-intercept = 3. Equation: y = 2x + 3." },

  { id:4, testType:"SAT", section:"Math", topic:"Systems of Equations", difficulty:"medium",
    question:"If 2x + y = 10 and x − y = 2, what is x?",
    options:["A) 2","B) 3","C) 4","D) 6"], correct:"C",
    explanation:"Add the two equations: 3x = 12, so x = 4." },

  { id:5, testType:"SAT", section:"Math", topic:"Quadratics", difficulty:"medium",
    question:"What are the solutions to x² − 5x + 6 = 0?",
    options:["A) x = 2, x = 3","B) x = −2, x = −3","C) x = 1, x = 6","D) x = −1, x = 6"], correct:"A",
    explanation:"Factor: (x − 2)(x − 3) = 0, so x = 2 or x = 3." },

  { id:6, testType:"SAT", section:"Math", topic:"Quadratics", difficulty:"hard",
    question:"The quadratic y = x² + bx + c has roots x = 1 and x = 7. What is the value of c?",
    options:["A) −7","B) 7","C) −8","D) 8"], correct:"B",
    explanation:"By Vieta's formulas, the product of the roots = c/1. So c = 1 × 7 = 7." },

  { id:7, testType:"SAT", section:"Math", topic:"Data Analysis", difficulty:"easy",
    question:"A bag has 3 red, 5 blue, and 2 green marbles. What is the probability of picking blue?",
    options:["A) 1/2","B) 3/10","C) 2/5","D) 1/5"], correct:"A",
    explanation:"Total = 10. P(blue) = 5/10 = 1/2." },

  { id:8, testType:"SAT", section:"Math", topic:"Data Analysis", difficulty:"medium",
    question:"The mean of 5, 9, 12, and n is 10. What is n?",
    options:["A) 10","B) 12","C) 14","D) 16"], correct:"C",
    explanation:"Sum = 10 × 4 = 40. So 5 + 9 + 12 + n = 40, giving n = 14." },

  { id:9, testType:"SAT", section:"Math", topic:"Geometry", difficulty:"medium",
    question:"A right triangle has legs of length 6 and 8. What is the hypotenuse?",
    options:["A) 10","B) 12","C) 14","D) 100"], correct:"A",
    explanation:"c² = 6² + 8² = 36 + 64 = 100, so c = 10." },

  { id:10, testType:"SAT", section:"Math", topic:"Functions", difficulty:"medium",
    question:"If f(x) = 3x² − 2, what is f(−3)?",
    options:["A) 25","B) 29","C) −29","D) 7"], correct:"A",
    explanation:"f(−3) = 3(9) − 2 = 27 − 2 = 25." },

  { id:11, testType:"SAT", section:"Math", topic:"Inequalities", difficulty:"medium",
    question:"Which value of x satisfies 2x − 3 > 7?",
    options:["A) 3","B) 4","C) 5","D) 6"], correct:"D",
    explanation:"2x > 10, so x > 5. Only x = 6 satisfies this." },

  { id:12, testType:"SAT", section:"Math", topic:"Percentages", difficulty:"easy",
    question:"A jacket costs $80 and is 25% off. What is the sale price?",
    options:["A) $55","B) $60","C) $65","D) $70"], correct:"B",
    explanation:"25% of $80 = $20. Sale price = $80 − $20 = $60." },

  { id:13, testType:"SAT", section:"Math", topic:"Exponents", difficulty:"medium",
    question:"What is (2³ × 2⁴) ÷ 2⁵?",
    options:["A) 2","B) 4","C) 8","D) 16"], correct:"B",
    explanation:"2³ × 2⁴ = 2⁷. Then 2⁷ ÷ 2⁵ = 2² = 4." },

  { id:14, testType:"SAT", section:"Math", topic:"Geometry", difficulty:"hard",
    question:"A circle has radius 5. What is the area of a sector with a central angle of 72°?",
    options:["A) 5π","B) 5π/2","C) 10π","D) 25π"], correct:"A",
    explanation:"Sector area = (72/360) × π × 5² = (1/5) × 25π = 5π." },

  { id:15, testType:"SAT", section:"Math", topic:"Rates and Ratios", difficulty:"medium",
    question:"A car travels 180 miles in 3 hours. How far does it travel in 5 hours at the same rate?",
    options:["A) 250 mi","B) 270 mi","C) 300 mi","D) 320 mi"], correct:"C",
    explanation:"Rate = 60 mph. 60 × 5 = 300 miles." },

  // ── SAT READING ───────────────────────────────────────────────────────────
  { id:16, testType:"SAT", section:"Reading", topic:"Main Idea", difficulty:"medium",
    question:"Passage: The honeybee's waggle dance is one of nature's most sophisticated communication systems. By varying the angle and duration of its figure-eight dance, a bee conveys the direction and distance of a food source to its hivemates. Scientists have long admired this elegant form of nonverbal communication, which rivals human language in its precision.\n\nThe primary purpose of the passage is to:",
    options:["A) Argue that bees are more intelligent than previously thought","B) Describe and praise the honeybee's communication method","C) Compare animal communication to human language in detail","D) Explain the evolutionary origins of the waggle dance"], correct:"B",
    explanation:"The passage describes the waggle dance mechanism and praises it ('most sophisticated,' 'rivals human language'). It does not argue bees are smarter, make a detailed comparison, or discuss evolution." },

  { id:17, testType:"SAT", section:"Reading", topic:"Words in Context", difficulty:"medium",
    question:"Passage: The treaty was seen as a seminal moment in international diplomacy, establishing frameworks that would govern negotiations for the next century.\n\nAs used in the passage, 'seminal' most nearly means:",
    options:["A) Controversial","B) Foundational","C) Brief","D) Forgotten"], correct:"B",
    explanation:"'Seminal' means influential and formative — i.e., foundational. The passage emphasizes its lasting, century-long impact." },

  { id:18, testType:"SAT", section:"Reading", topic:"Evidence", difficulty:"hard",
    question:"Passage: Urban heat islands form when natural land cover is replaced with pavement and buildings that absorb heat. This phenomenon disproportionately affects low-income neighborhoods, which have fewer trees and green spaces. Studies show that on the hottest days, these areas can be 7°F warmer than nearby wealthier neighborhoods.\n\nWhich claim is best supported by the passage?",
    options:["A) Urban heat islands are caused solely by industrial pollution","B) All cities experience equal heat island effects","C) Poorer neighborhoods tend to experience more intense heat island effects","D) Urban heat islands raise temperatures by exactly 7°F everywhere"], correct:"C",
    explanation:"The passage directly states the phenomenon 'disproportionately affects low-income neighborhoods.' The 7°F figure is a maximum on the hottest days, not a universal value." },

  { id:19, testType:"SAT", section:"Reading", topic:"Inference", difficulty:"hard",
    question:"Passage: When the pharmaceutical company released its earnings report, analysts who had predicted a strong quarter fell silent. The stock, which had been buoyed by speculation for months, fell 18% in after-hours trading.\n\nIt can reasonably be inferred that:",
    options:["A) The analysts had accurately predicted the company's performance","B) The earnings report was worse than analysts expected","C) The stock had been declining for several months","D) The company planned to release a new drug soon"], correct:"B",
    explanation:"Analysts who predicted a strong quarter 'fell silent' and the stock dropped 18% — together these imply the results disappointed expectations." },

  { id:20, testType:"SAT", section:"Reading", topic:"Tone", difficulty:"medium",
    question:"Passage: Critics once dismissed abstract expressionism as chaotic self-indulgence, mere splashes of paint with no technical discipline. Yet these same critics were later compelled to acknowledge that artists like Pollock and de Kooning had forged an entirely new visual language — one that demanded as much skill as any traditional form.\n\nThe author's tone toward the critics is best described as:",
    options:["A) Sympathetic","B) Sardonic","C) Neutral","D) Admiring"], correct:"B",
    explanation:"The author notes critics were 'compelled to acknowledge' they were wrong — a subtle mockery. 'Sardonic' (mockingly critical) fits best." },

  // ── SAT WRITING ───────────────────────────────────────────────────────────
  { id:21, testType:"SAT", section:"Writing", topic:"Punctuation", difficulty:"easy",
    question:"Choose the correct punctuation:\n'The scientist published her findings __ however, the results were disputed.'",
    options:["A) ,","B) ;","C) :","D) —"], correct:"B",
    explanation:"A semicolon is needed before a conjunctive adverb ('however') joining two independent clauses." },

  { id:22, testType:"SAT", section:"Writing", topic:"Subject-Verb Agreement", difficulty:"easy",
    question:"Choose the correct verb:\n'Neither the students nor the teacher __ ready for the exam.'",
    options:["A) were","B) was","C) are","D) have been"], correct:"B",
    explanation:"With 'neither...nor,' the verb agrees with the nearest subject. 'Teacher' is singular, so use 'was.'" },

  { id:23, testType:"SAT", section:"Writing", topic:"Sentence Structure", difficulty:"medium",
    question:"Which revision corrects this sentence?\n'Running through the park, the rain began to fall.'",
    options:["A) Running through the park, the rain fell suddenly.","B) As I was running through the park, the rain began to fall.","C) The rain began to fall, running through the park.","D) No change needed."], correct:"B",
    explanation:"The original has a dangling modifier — 'Running through the park' must modify a person, not 'rain.' Option B correctly adds the subject 'I.'" },

  { id:24, testType:"SAT", section:"Writing", topic:"Conciseness", difficulty:"medium",
    question:"Which is most concise without losing meaning?\n'Due to the fact that it was raining, the game was cancelled.'",
    options:["A) Due to the fact that it was raining, the game was cancelled.","B) Because it was raining, the game was cancelled.","C) On account of the falling rain, the game was cancelled.","D) Given that rain was occurring, cancellation of the game occurred."], correct:"B",
    explanation:"'Because' replaces the wordy 'due to the fact that.' The SAT rewards concise, direct writing." },

  { id:25, testType:"SAT", section:"Writing", topic:"Transition Words", difficulty:"medium",
    question:"Choose the best transition:\n'Solar power is becoming cheaper. __, many utilities still rely on fossil fuels.'",
    options:["A) Therefore","B) Similarly","C) Nevertheless","D) For example"], correct:"C",
    explanation:"The second sentence contrasts with the first. 'Nevertheless' signals this contrast." },

  { id:26, testType:"SAT", section:"Writing", topic:"Apostrophes", difficulty:"easy",
    question:"Choose the correct form:\n'The committee made __ decision after lengthy debate.'",
    options:["A) its'","B) it's","C) its","D) their's"], correct:"C",
    explanation:"'Its' (no apostrophe) is the possessive pronoun. 'It's' = 'it is.' 'Its'' is never correct." },

  // ── ACT ENGLISH ───────────────────────────────────────────────────────────
  { id:27, testType:"ACT", section:"English", topic:"Commas", difficulty:"easy",
    question:"Choose the correctly punctuated sentence:",
    options:["A) My brother, who lives in Boston has three cats.","B) My brother who lives in Boston, has three cats.","C) My brother, who lives in Boston, has three cats.","D) My brother who lives in Boston has three cats."], correct:"C",
    explanation:"'Who lives in Boston' is a non-restrictive clause and must be set off with commas on both sides." },

  { id:28, testType:"ACT", section:"English", topic:"Verb Tense", difficulty:"medium",
    question:"Choose the correct verb:\n'By the time the guests arrived, the hosts __ the dinner.'",
    options:["A) prepared","B) have prepared","C) had prepared","D) prepare"], correct:"C",
    explanation:"Past perfect ('had prepared') shows an action completed before another past action ('arrived')." },

  { id:29, testType:"ACT", section:"English", topic:"Redundancy", difficulty:"medium",
    question:"Which sentence contains a redundancy that should be cut?",
    options:["A) The unexpected surprise delighted everyone.","B) The students submitted their essays on time.","C) The professor revised her lecture notes.","D) The annual conference occurs every year."], correct:"D",
    explanation:"'Annual' already means 'every year,' so 'occurs every year' is redundant." },

  { id:30, testType:"ACT", section:"English", topic:"Organization", difficulty:"hard",
    question:"A student writes these sentences:\n[1] The results confirmed the hypothesis.\n[2] The experiment was conducted over three weeks.\n[3] Data was collected daily.\n[4] First, a hypothesis was formed.\n\nWhat is the most logical order?",
    options:["A) 1, 2, 3, 4","B) 4, 2, 3, 1","C) 2, 4, 3, 1","D) 4, 3, 2, 1"], correct:"B",
    explanation:"Logical order: form hypothesis (4) → conduct experiment (2) → collect data (3) → confirm results (1)." },

  { id:31, testType:"ACT", section:"English", topic:"Colons and Semicolons", difficulty:"medium",
    question:"Choose the correctly punctuated sentence:",
    options:["A) She had one goal: to win the championship.","B) She had one goal; to win the championship.","C) She had one goal, to win the championship.","D) She had one goal to win the championship."], correct:"A",
    explanation:"A colon introduces an elaboration after a complete independent clause. Option B (semicolon) is wrong because 'to win...' is not an independent clause." },

  // ── ACT MATH ─────────────────────────────────────────────────────────────
  { id:32, testType:"ACT", section:"Math", topic:"Pre-Algebra", difficulty:"easy",
    question:"What is 15% of 240?",
    options:["A) 24","B) 30","C) 36","D) 48"], correct:"C",
    explanation:"0.15 × 240 = 36." },

  { id:33, testType:"ACT", section:"Math", topic:"Algebra", difficulty:"medium",
    question:"If 5x − 3 = 2x + 12, what is x?",
    options:["A) 3","B) 5","C) 7","D) 9"], correct:"B",
    explanation:"3x = 15, so x = 5." },

  { id:34, testType:"ACT", section:"Math", topic:"Geometry", difficulty:"medium",
    question:"What is the area of a trapezoid with parallel sides of 6 and 10 and height 4?",
    options:["A) 24","B) 32","C) 40","D) 48"], correct:"B",
    explanation:"Area = ½(b₁ + b₂) × h = ½(16) × 4 = 32." },

  { id:35, testType:"ACT", section:"Math", topic:"Trigonometry", difficulty:"hard",
    question:"In a right triangle, the side opposite a 30° angle has length 5. What is the hypotenuse?",
    options:["A) 5","B) 5√3","C) 10","D) 10√3"], correct:"C",
    explanation:"sin(30°) = 0.5 = opposite/hypotenuse = 5/h. So h = 10." },

  { id:36, testType:"ACT", section:"Math", topic:"Coordinate Geometry", difficulty:"medium",
    question:"What is the distance between (1, 2) and (4, 6)?",
    options:["A) 3","B) 4","C) 5","D) 7"], correct:"C",
    explanation:"√[(4−1)² + (6−2)²] = √[9+16] = √25 = 5." },

  { id:37, testType:"ACT", section:"Math", topic:"Statistics", difficulty:"medium",
    question:"The data set {3, 5, 7, 7, 9, 11} has which median?",
    options:["A) 6","B) 7","C) 7.5","D) 8"], correct:"B",
    explanation:"Median of 6 values = average of 3rd and 4th = (7+7)/2 = 7." },

  { id:38, testType:"ACT", section:"Math", topic:"Polynomials", difficulty:"medium",
    question:"What is (x + 3)(x − 5) expanded?",
    options:["A) x² − 2x − 15","B) x² + 2x − 15","C) x² − 8x − 15","D) x² − 2x + 15"], correct:"A",
    explanation:"FOIL: x² − 5x + 3x − 15 = x² − 2x − 15." },

  { id:39, testType:"ACT", section:"Math", topic:"Sequences", difficulty:"medium",
    question:"The first three terms of an arithmetic sequence are 4, 9, 14. What is the 10th term?",
    options:["A) 49","B) 45","C) 54","D) 59"], correct:"A",
    explanation:"Common difference = 5. 10th term = 4 + 9(5) = 49." },

  // ── ACT READING ───────────────────────────────────────────────────────────
  { id:40, testType:"ACT", section:"Reading", topic:"Literary Narrative", difficulty:"medium",
    question:"Passage: Elena had always found solace in the library's silence. The other children played outside, their laughter drifting in like smoke, but she preferred the company of characters who never judged her for being too quiet, too serious, too much herself.\n\nThe passage primarily suggests that Elena:",
    options:["A) Dislikes other children","B) Finds comfort in reading because she feels accepted","C) Is forced to stay inside by her parents","D) Wants to become a librarian"], correct:"B",
    explanation:"Books offer 'characters who never judged her,' directly suggesting she finds acceptance and comfort through reading." },

  { id:41, testType:"ACT", section:"Reading", topic:"Social Science", difficulty:"hard",
    question:"Passage: Researchers found that passive social media consumption — scrolling without posting — was more strongly correlated with feelings of loneliness than active engagement. Those who commented and shared reported higher social satisfaction despite spending equal time on the platforms.\n\nWhich factor best predicts loneliness among teen social media users?",
    options:["A) Total time spent on social media","B) The type of platform used","C) Whether the teen scrolls without interacting","D) The number of followers a teen has"], correct:"C",
    explanation:"The passage explicitly states passive consumption was more correlated with loneliness than active engagement, despite equal time spent." },

  { id:42, testType:"ACT", section:"Reading", topic:"Natural Science", difficulty:"medium",
    question:"Passage: Tardigrades can survive extreme heat, the vacuum of space, and high doses of radiation. They do this by entering a state called cryptobiosis, in which metabolic processes slow to near zero.\n\nIn what state do tardigrades survive extreme conditions?",
    options:["A) Hibernation","B) Cryptobiosis","C) Dormancy","D) Estivation"], correct:"B",
    explanation:"The passage explicitly names the state as cryptobiosis." },

  // ── ACT SCIENCE ───────────────────────────────────────────────────────────
  { id:43, testType:"ACT", section:"Science", topic:"Data Representation", difficulty:"medium",
    question:"A table shows plant growth (cm) after 4 weeks:\nControl = 12 cm | Low Nutrient = 8 cm | High Nutrient = 18 cm | Toxic Nutrient = 4 cm\n\nWhich condition produced the greatest growth?",
    options:["A) Control","B) Low Nutrient","C) High Nutrient","D) Toxic Nutrient"], correct:"C",
    explanation:"High Nutrient = 18 cm, the largest value in the table." },

  { id:44, testType:"ACT", section:"Science", topic:"Research Summaries", difficulty:"hard",
    question:"Scientists measured enzyme reaction rates at 10°C, 20°C, 37°C, and 60°C:\nRates: 5, 15, 40, and 3 units/min.\n\nWhich conclusion is best supported?",
    options:["A) Higher temperatures always increase enzyme activity","B) Enzyme activity peaks near 37°C and drops at extremes","C) Temperature has no effect on enzymes","D) Enzymes work best below 20°C"], correct:"B",
    explanation:"Activity rose from 5→15→40 then crashed to 3 at 60°C. The peak is at 37°C (body temperature), with sharp decline at extreme heat." },

  { id:45, testType:"ACT", section:"Science", topic:"Conflicting Viewpoints", difficulty:"hard",
    question:"Scientist 1: CO₂ is the primary driver of recent climate change; data since 1950 shows a clear correlation with rising temperatures.\nScientist 2: Natural cycles (solar output, volcanic activity) better explain historical temperature variations. Human CO₂ is too small relative to natural sources.\n\nWhich finding best supports Scientist 1?",
    options:["A) Evidence volcanic activity was unusually high after 1950","B) Data showing solar output was constant while temperatures rose","C) Records showing CO₂ levels were equally high 500 years ago","D) Evidence CO₂ naturally fluctuates by large amounts"], correct:"B",
    explanation:"If solar output stayed constant while temperatures rose, Scientist 2's natural cycle explanation is weakened, supporting Scientist 1's CO₂ argument." },

  { id:46, testType:"ACT", section:"Science", topic:"Data Representation", difficulty:"medium",
    question:"A graph shows bacteria (thousands) in a culture:\nHour 0 = 1 | Hour 2 = 4 | Hour 4 = 16 | Hour 6 = 64\n\nWhat type of growth does this represent?",
    options:["A) Linear","B) Exponential","C) Logistic","D) Arithmetic"], correct:"B",
    explanation:"The count multiplies by 4 every 2 hours (1→4→16→64), which is exponential growth." },

  // ── BOTH SAT & ACT ────────────────────────────────────────────────────────
  { id:47, testType:"BOTH", section:"Math", topic:"Ratios and Proportions", difficulty:"medium",
    question:"If 4 workers complete a job in 6 days, how many days will 8 workers take at the same rate?",
    options:["A) 2 days","B) 3 days","C) 4 days","D) 12 days"], correct:"B",
    explanation:"Total work = 24 worker-days. With 8 workers: 24 ÷ 8 = 3 days." },

  { id:48, testType:"BOTH", section:"Math", topic:"Word Problems", difficulty:"medium",
    question:"Apples cost $0.75 each, oranges $1.25 each. Maria buys 4 apples and 3 oranges. How much does she spend?",
    options:["A) $5.25","B) $6.25","C) $6.75","D) $7.00"], correct:"C",
    explanation:"4 × $0.75 = $3.00. 3 × $1.25 = $3.75. Total = $6.75." },

  { id:49, testType:"BOTH", section:"Math", topic:"Number Sense", difficulty:"easy",
    question:"Which of the following is NOT a prime number?",
    options:["A) 2","B) 7","C) 11","D) 9"], correct:"D",
    explanation:"9 = 3 × 3, so it is not prime. 2, 7, and 11 are all prime." },

  { id:50, testType:"BOTH", section:"Math", topic:"Fractions", difficulty:"easy",
    question:"What is 3/4 + 2/3?",
    options:["A) 5/7","B) 9/12","C) 17/12","D) 7/12"], correct:"C",
    explanation:"Common denominator 12: 9/12 + 8/12 = 17/12." },

  { id:51, testType:"BOTH", section:"Math", topic:"Geometry", difficulty:"medium",
    question:"What is the volume of a rectangular box with dimensions 3 × 4 × 5?",
    options:["A) 12","B) 47","C) 60","D) 94"], correct:"C",
    explanation:"Volume = 3 × 4 × 5 = 60." },

  { id:52, testType:"BOTH", section:"Math", topic:"Algebra", difficulty:"hard",
    question:"If x² − 9 = 0, what are the values of x?",
    options:["A) x = 3 only","B) x = −3 only","C) x = 3 or x = −3","D) x = 9 or x = −9"], correct:"C",
    explanation:"x² = 9, so x = ±3." },

  { id:53, testType:"BOTH", section:"Math", topic:"Functions", difficulty:"medium",
    question:"If g(x) = 2x − 4, what is g(7)?",
    options:["A) 6","B) 10","C) 14","D) 18"], correct:"B",
    explanation:"g(7) = 2(7) − 4 = 10." },

  { id:54, testType:"BOTH", section:"Math", topic:"Inequalities", difficulty:"medium",
    question:"What is the solution to −2x > 8?",
    options:["A) x > −4","B) x < −4","C) x > 4","D) x < 4"], correct:"B",
    explanation:"Divide by −2 and flip the inequality: x < −4." },

  { id:55, testType:"BOTH", section:"Math", topic:"Algebra", difficulty:"medium",
    question:"If 2x + 3y = 12 and x = 3, what is y?",
    options:["A) 1","B) 2","C) 3","D) 4"], correct:"B",
    explanation:"Substitute x = 3: 6 + 3y = 12, so 3y = 6, y = 2." },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

function getQuestions({ testType, section, topic, difficulty, count = 10 } = {}) {
  let pool = [...QUESTIONS];
  if (testType && testType !== 'BOTH') pool = pool.filter(q => q.testType === testType || q.testType === 'BOTH');
  if (section)    pool = pool.filter(q => q.section.toLowerCase() === section.toLowerCase());
  if (topic)      pool = pool.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
  if (difficulty) pool = pool.filter(q => q.difficulty === difficulty);
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

function getQuestionById(id) {
  return QUESTIONS.find(q => q.id === id) || null;
}

function getSections(testType) {
  let pool = QUESTIONS;
  if (testType && testType !== 'BOTH') pool = pool.filter(q => q.testType === testType || q.testType === 'BOTH');
  return [...new Set(pool.map(q => q.section))].sort();
}

function getTopics(testType, section) {
  let pool = QUESTIONS;
  if (testType && testType !== 'BOTH') pool = pool.filter(q => q.testType === testType || q.testType === 'BOTH');
  if (section) pool = pool.filter(q => q.section.toLowerCase() === section.toLowerCase());
  return [...new Set(pool.map(q => q.topic))].sort();
}

function getFullPracticeTest(testType) {
  if (testType === 'SAT') {
    return [
      { name: 'Math',    questions: getQuestions({ testType: 'SAT', section: 'Math',    count: 20 }), timeMinutes: 30 },
      { name: 'Reading', questions: getQuestions({ testType: 'SAT', section: 'Reading', count: 5  }), timeMinutes: 10 },
      { name: 'Writing', questions: getQuestions({ testType: 'SAT', section: 'Writing', count: 6  }), timeMinutes: 12 },
    ];
  } else {
    return [
      { name: 'English', questions: getQuestions({ testType: 'ACT', section: 'English', count: 5  }), timeMinutes: 8  },
      { name: 'Math',    questions: getQuestions({ testType: 'ACT', section: 'Math',    count: 20 }), timeMinutes: 25 },
      { name: 'Reading', questions: getQuestions({ testType: 'ACT', section: 'Reading', count: 3  }), timeMinutes: 8  },
      { name: 'Science', questions: getQuestions({ testType: 'ACT', section: 'Science', count: 4  }), timeMinutes: 8  },
    ];
  }
}
