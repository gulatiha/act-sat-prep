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

  // ── MORE ACT ENGLISH ──────────────────────────────────────────────────────
  { id:56, testType:"ACT", section:"English", topic:"Parallelism", difficulty:"medium",
    question:"Choose the correctly parallel sentence:",
    options:["A) She enjoys hiking, to swim, and running.","B) She enjoys hiking, swimming, and running.","C) She enjoys to hike, swimming, and to run.","D) She enjoys hike, swim, and run."], correct:"B",
    explanation:"Parallel structure requires all items in a list to have the same grammatical form. 'Hiking, swimming, and running' are all gerunds (-ing forms)." },

  { id:57, testType:"ACT", section:"English", topic:"Run-on Sentences", difficulty:"medium",
    question:"Which correctly fixes this run-on?\n'The experiment failed the researchers were not discouraged.'",
    options:["A) The experiment failed, the researchers were not discouraged.","B) The experiment failed; the researchers were not discouraged.","C) The experiment failed but, the researchers were not discouraged.","D) No change needed."], correct:"B",
    explanation:"A semicolon correctly joins two independent clauses. Option A creates a comma splice (still a run-on). Option C incorrectly places a comma after 'but.'" },

  { id:58, testType:"ACT", section:"English", topic:"Word Choice", difficulty:"easy",
    question:"Choose the correct word:\n'The medicine had a significant __ on the patient's recovery.'",
    options:["A) affect","B) effect","C) effected","D) affecting"], correct:"B",
    explanation:"'Effect' is the noun (a result). 'Affect' is the verb (to influence). The sentence needs a noun after the article 'a.'" },

  { id:59, testType:"ACT", section:"English", topic:"Pronoun Case", difficulty:"medium",
    question:"Choose the correct pronoun:\n'The award was given to Maria and __.'",
    options:["A) I","B) me","C) myself","D) mine"], correct:"B",
    explanation:"After a preposition ('to'), use the objective case: 'me.' Test it by removing 'Maria and' — 'The award was given to me' is correct, not 'to I.'" },

  { id:60, testType:"ACT", section:"English", topic:"Sentence Fragments", difficulty:"medium",
    question:"Which of the following is a complete sentence?",
    options:["A) Running through the halls and shouting.","B) Because the storm was approaching.","C) Although she studied hard for the test.","D) The student arrived early and took her seat."], correct:"D",
    explanation:"Option D has a subject ('the student') and a complete predicate. Options A, B, and C are fragments — A lacks a subject, B and C are dependent clauses." },

  { id:61, testType:"ACT", section:"English", topic:"Relative Pronouns", difficulty:"medium",
    question:"Choose the correct relative pronoun:\n'The building __ was destroyed in the fire has been rebuilt.'",
    options:["A) who","B) whom","C) that","D) whose"], correct:"C",
    explanation:"'Who' and 'whom' refer to people. 'That' refers to things or places. Since 'building' is a thing, use 'that.'" },

  { id:62, testType:"ACT", section:"English", topic:"Conciseness", difficulty:"easy",
    question:"Which sentence is the most concise?",
    options:["A) At this point in time, we are currently unable to proceed forward.","B) At this time, we are unable to proceed.","C) Currently, at this present moment, we cannot proceed forward.","D) We cannot proceed."], correct:"D",
    explanation:"'We cannot proceed' conveys the full meaning with no redundancy. 'At this time,' 'currently,' 'forward,' and 'proceed forward' are all unnecessary additions." },

  { id:63, testType:"ACT", section:"English", topic:"Modifiers", difficulty:"hard",
    question:"Which sentence correctly places the modifier?",
    options:["A) Almost the committee approved every proposal.","B) The committee approved almost every proposal.","C) The committee almost approved every proposal.","D) The committee approved every almost proposal."], correct:"B",
    explanation:"'Almost' must be placed directly before 'every proposal' (what it modifies). Option C changes the meaning to imply the committee nearly approved but didn't." },

  { id:64, testType:"ACT", section:"English", topic:"Apostrophes", difficulty:"easy",
    question:"Choose the correct form:\n'The __ locker room was remodeled over the summer.'",
    options:["A) players","B) player's","C) players'","D) players's"], correct:"C",
    explanation:"Multiple players share one locker room, so use the plural possessive: players' (add apostrophe after the 's' for plural nouns ending in 's')." },

  { id:65, testType:"ACT", section:"English", topic:"Transitions", difficulty:"medium",
    question:"Choose the best transition:\n'The new policy was designed to save money. __, it ended up costing more.'",
    options:["A) Furthermore","B) Similarly","C) Ironically","D) Therefore"], correct:"C",
    explanation:"'Ironically' signals an unexpected or contradictory outcome — a money-saving policy that costs more. 'Furthermore' and 'Similarly' add, not contrast. 'Therefore' implies logical consequence." },

  { id:66, testType:"ACT", section:"English", topic:"Punctuation", difficulty:"medium",
    question:"Which sentence uses a dash correctly?",
    options:["A) She packed everything she needed — her passport, her tickets, and her phone.","B) She — packed everything she needed.","C) She packed — everything, she needed.","D) She packed everything — she, needed."], correct:"A",
    explanation:"A dash (—) can introduce a list or elaboration after a complete clause. Option A correctly uses a dash to introduce the list of items she packed." },

  { id:67, testType:"ACT", section:"English", topic:"Subject-Verb Agreement", difficulty:"medium",
    question:"Choose the correct verb:\n'The number of students who passed the exam __ surprisingly high.'",
    options:["A) were","B) are","C) was","D) have been"], correct:"C",
    explanation:"'The number' is the subject (singular), not 'students.' 'The number of X is' (singular) vs. 'A number of X are' (plural) — this is a classic distinction." },

  { id:68, testType:"ACT", section:"English", topic:"Colons and Semicolons", difficulty:"hard",
    question:"Which sentence uses punctuation correctly?",
    options:["A) The results were clear: the new drug was ineffective.","B) The results were clear; the new drug was ineffective.","C) The results were clear, the new drug was ineffective.","D) Both A and B are correct."], correct:"D",
    explanation:"Both a colon (introducing a conclusion) and a semicolon (joining two related independent clauses) are grammatically correct here. Option C is a comma splice." },

  { id:69, testType:"ACT", section:"English", topic:"Verb Tense", difficulty:"hard",
    question:"Choose the correct verb form:\n'If she __ harder, she would have passed the exam.'",
    options:["A) studied","B) had studied","C) would study","D) studies"], correct:"B",
    explanation:"In a past counterfactual conditional (something that didn't happen), use past perfect ('had studied') in the if-clause and 'would have + past participle' in the result clause." },

  // ── MORE SAT READING ──────────────────────────────────────────────────────
  { id:70, testType:"SAT", section:"Reading", topic:"Author's Purpose", difficulty:"medium",
    question:"Passage: For decades, scientists dismissed the idea that birds could navigate using Earth's magnetic field as fringe science. New research, however, has identified magnetite crystals in birds' beaks that may function as a biological compass — quietly vindicating the skeptics' skeptics.\n\nThe author's primary purpose is to:",
    options:["A) Criticize scientists for dismissing magnetic navigation","B) Explain how Earth's magnetic field works","C) Describe evidence that challenges a long-held scientific dismissal","D) Argue that all animals can sense magnetic fields"], correct:"C",
    explanation:"The passage describes new research ('magnetite crystals') that supports an idea previously dismissed. The purpose is to present evidence — not to criticize, explain magnetism broadly, or make a claim about all animals." },

  { id:71, testType:"SAT", section:"Reading", topic:"Structure", difficulty:"hard",
    question:"Passage: Paragraph 1: The city's new transit plan promises to reduce commute times by 30%. Paragraph 2: Three previous plans made identical promises and failed. Paragraph 3: Analysts note this plan uses a different funding model.\n\nHow does paragraph 2 function in the passage?",
    options:["A) It provides data supporting the new plan","B) It introduces a complication that paragraph 3 then addresses","C) It argues the new plan will definitely fail","D) It summarizes the author's conclusion"], correct:"B",
    explanation:"Paragraph 2 raises a problem (past failures), which paragraph 3 then addresses by noting the new plan differs. This is a classic 'complication → response' structure." },

  { id:72, testType:"SAT", section:"Reading", topic:"Words in Context", difficulty:"medium",
    question:"Passage: The economist's analysis was lauded for its parsimony — it explained complex market behavior using only three variables where previous models had required dozens.\n\nAs used in the passage, 'parsimony' most nearly means:",
    options:["A) Generosity","B) Economy and simplicity","C) Inaccuracy","D) Complexity"], correct:"B",
    explanation:"In scientific contexts, 'parsimony' means using the minimum necessary to explain something. The passage defines it — 'three variables where previous models had required dozens' — pointing to simplicity." },

  { id:73, testType:"SAT", section:"Reading", topic:"Evidence", difficulty:"hard",
    question:"Passage: Standardized tests have long been criticized for favoring students from higher-income households, who have access to expensive test prep. A recent study found that students whose families spent over $1,000 on prep scored, on average, 39 points higher than unprepared peers on a 1600-point scale.\n\nWhich statement is directly supported by the passage?",
    options:["A) Standardized tests are unfair and should be eliminated","B) Test prep guarantees a higher score","C) Spending over $1,000 on prep was associated with a modest score advantage","D) All income disparities in test scores are caused by test prep spending"], correct:"C",
    explanation:"The passage says students who spent $1,000+ scored 39 points higher on average — a correlation, not a guarantee. The passage doesn't call for elimination or claim prep is the only cause of disparities." },

  { id:74, testType:"SAT", section:"Reading", topic:"Inference", difficulty:"medium",
    question:"Passage: The documentary received unanimous praise from critics, won three major awards, and was viewed by over five million people in its first week — and yet its director has never been offered a studio deal.\n\nWhat can be reasonably inferred?",
    options:["A) The director does not want a studio deal","B) Studios value commercial success over critical acclaim","C) Commercial or industry factors beyond critical success influence studio decisions","D) The documentary was actually a financial failure"], correct:"C",
    explanation:"The documentary succeeded critically and in viewership but the director got no studio deal — suggesting factors beyond critical success (connections, genre, budget requirements) influence industry decisions. We can't infer the director doesn't want one, or that studios ignore acclaim entirely." },

  // ── MORE SAT WRITING ──────────────────────────────────────────────────────
  { id:75, testType:"SAT", section:"Writing", topic:"Combining Sentences", difficulty:"medium",
    question:"Which best combines these sentences?\n'The report was thorough. It was also clearly written. It persuaded the board.'",
    options:["A) The report was thorough, clearly written, and persuaded the board.","B) The report was thorough and clearly written, persuading the board.","C) The report was thorough. It was clearly written and persuaded the board.","D) Being thorough and clear, the board was persuaded by the report."], correct:"B",
    explanation:"Option B combines all three ideas efficiently and uses parallel adjectives ('thorough and clearly written') followed by a participial phrase. Option D has a dangling modifier (the board wasn't thorough and clear — the report was)." },

  { id:76, testType:"SAT", section:"Writing", topic:"Verb Agreement", difficulty:"medium",
    question:"Choose the correct verb:\n'Data from the three studies __ that the treatment is effective.'",
    options:["A) suggest","B) suggests","C) are suggesting","D) have suggested"], correct:"A",
    explanation:"'Data' is technically plural (datum/data), and modern SAT usage treats it as plural. 'Data suggest' is the formally correct form. Note: 'The data suggests' is increasingly accepted, but the SAT prefers the traditional plural." },

  { id:77, testType:"SAT", section:"Writing", topic:"Misplaced Modifiers", difficulty:"hard",
    question:"Which sentence is correctly written?",
    options:["A) Painted in bold strokes, the critic admired the mural.","B) The critic admired the mural, which was painted in bold strokes.","C) The mural, painted in bold strokes, the critic admired it.","D) Admiring the mural, it was painted in bold strokes."], correct:"B",
    explanation:"Option A implies the critic was painted in bold strokes. Option B correctly places 'which was painted in bold strokes' as a relative clause modifying 'the mural.'" },

  { id:78, testType:"SAT", section:"Writing", topic:"Punctuation", difficulty:"medium",
    question:"Choose the correctly punctuated sentence:",
    options:["A) The study which lasted three years produced unexpected results.","B) The study, which lasted three years, produced unexpected results.","C) The study that lasted three years, produced unexpected results.","D) The study — which lasted three years produced unexpected results."], correct:"B",
    explanation:"'Which lasted three years' is a non-restrictive (non-essential) clause — it adds information but doesn't define which study. Non-restrictive clauses need commas on both sides." },

  { id:79, testType:"SAT", section:"Writing", topic:"Conciseness", difficulty:"easy",
    question:"Which is most concise?\n'In the event that you are unable to attend, please let us know in advance ahead of time.'",
    options:["A) In the event that you are unable to attend, please let us know in advance ahead of time.","B) If you cannot attend, please let us know in advance.","C) Should you be unable to attend, please notify us beforehand in advance.","D) In case you cannot make it to attend, let us know ahead of time in advance."], correct:"B",
    explanation:"'If you cannot attend, please let us know in advance' eliminates three redundancies: 'in the event that' → 'if,' 'ahead of time' is redundant with 'in advance.'" },

  // ── MORE ACT READING ──────────────────────────────────────────────────────
  { id:80, testType:"ACT", section:"Reading", topic:"Humanities", difficulty:"medium",
    question:"Passage: Jazz emerged in New Orleans in the early 20th century as a fusion of African rhythms, blues, and European harmonic structures. Unlike classical music, which followed strict compositional rules, jazz celebrated improvisation — the spontaneous creation of melody in the moment.\n\nAccording to the passage, what distinguishes jazz from classical music?",
    options:["A) Jazz originated in Europe while classical music came from Africa","B) Jazz uses improvisation while classical music follows strict rules","C) Classical music is more popular than jazz today","D) Jazz relies solely on African rhythmic traditions"], correct:"B",
    explanation:"The passage directly states jazz 'celebrated improvisation' while classical music 'followed strict compositional rules.' The other options are not supported or contradict the passage." },

  { id:81, testType:"ACT", section:"Reading", topic:"Social Science", difficulty:"medium",
    question:"Passage: A longitudinal study tracked 500 adults over 20 years and found that those who reported higher levels of social connection in their 40s were significantly less likely to develop cognitive decline in their 60s. The researchers controlled for exercise, diet, and education.\n\nThe phrase 'controlled for exercise, diet, and education' most likely means the researchers:",
    options:["A) Required participants to follow specific diet and exercise routines","B) Eliminated participants who exercised or were educated","C) Accounted for those factors so they wouldn't distort the findings","D) Found that exercise and diet had no effect on cognitive decline"], correct:"C",
    explanation:"'Controlling for' variables in research means accounting for them statistically to isolate the effect of the variable being studied (social connection)." },

  { id:82, testType:"ACT", section:"Reading", topic:"Literary Narrative", difficulty:"hard",
    question:"Passage: Marcus had rehearsed the speech a hundred times. He knew every pause, every inflection. But standing at the podium, watching his father's face in the front row — a face he had never seen look proud — he found he could not remember a single word.\n\nThe detail about his father's face primarily serves to:",
    options:["A) Show that Marcus is a poor public speaker","B) Reveal the emotional weight behind Marcus's memory lapse","C) Suggest that Marcus's father disapproves of the speech","D) Explain why Marcus prepared so thoroughly"], correct:"B",
    explanation:"Marcus forgot his speech not from lack of preparation but from the overwhelming emotion of seeing his father look proud for the first time. The detail reveals that emotion is the cause of the lapse." },

  // ── MORE ACT SCIENCE ──────────────────────────────────────────────────────
  { id:83, testType:"ACT", section:"Science", topic:"Research Summaries", difficulty:"medium",
    question:"A researcher tests a new fertilizer at three concentrations: 10 mg/L, 50 mg/L, and 100 mg/L. Plant heights after 4 weeks: 15 cm, 28 cm, and 19 cm.\n\nWhich conclusion is best supported?",
    options:["A) More fertilizer always produces taller plants","B) Plant growth peaks at a moderate fertilizer concentration","C) The fertilizer has no effect on plant growth","D) 100 mg/L is the optimal concentration for all plants"], correct:"B",
    explanation:"Growth peaked at 50 mg/L (28 cm) then declined at 100 mg/L (19 cm), indicating an optimal middle concentration. Higher concentrations may be toxic to plants." },

  { id:84, testType:"ACT", section:"Science", topic:"Data Representation", difficulty:"easy",
    question:"A table shows average monthly rainfall (cm): Jan=5, Feb=4, Mar=8, Apr=14, May=18, Jun=22.\n\nBetween which two months did rainfall increase the most?",
    options:["A) Jan to Feb","B) Feb to Mar","C) Mar to Apr","D) Apr to May"], correct:"C",
    explanation:"Changes: Jan→Feb = −1, Feb→Mar = +4, Mar→Apr = +6, Apr→May = +4. The largest increase (6 cm) occurred from March to April." },

  { id:85, testType:"ACT", section:"Science", topic:"Conflicting Viewpoints", difficulty:"medium",
    question:"Scientist A: Dinosaurs were warm-blooded (endothermic), based on bone growth patterns similar to modern mammals.\nScientist B: Dinosaurs were cold-blooded (ectothermic), since they were reptiles and reptiles are ectothermic.\n\nWhich evidence would WEAKEN Scientist B's argument?",
    options:["A) Discovery that some modern reptiles are partially warm-blooded","B) Fossil evidence showing dinosaur bones similar to cold-blooded reptiles","C) Data showing dinosaurs lived in cold climates","D) Evidence that all mammals are warm-blooded"], correct:"A",
    explanation:"Scientist B argues dinosaurs were cold-blooded because reptiles are cold-blooded. If some modern reptiles are partially warm-blooded, the core assumption ('reptiles are ectothermic') is weakened." },

  // ── MORE ACT MATH ─────────────────────────────────────────────────────────
  { id:86, testType:"ACT", section:"Math", topic:"Algebra", difficulty:"hard",
    question:"If f(x) = x² − 4 and g(x) = x + 2, what is f(g(1))?",
    options:["A) 3","B) 5","C) 9","D) −3"], correct:"B",
    explanation:"First: g(1) = 1 + 2 = 3. Then: f(3) = 3² − 4 = 9 − 4 = 5." },

  { id:87, testType:"ACT", section:"Math", topic:"Geometry", difficulty:"medium",
    question:"Two parallel lines are cut by a transversal. One angle measures 65°. What is the measure of the co-interior (same-side interior) angle?",
    options:["A) 65°","B) 115°","C) 25°","D) 180°"], correct:"B",
    explanation:"Co-interior angles (same-side interior) are supplementary, so they add to 180°. 180° − 65° = 115°." },

  { id:88, testType:"ACT", section:"Math", topic:"Pre-Algebra", difficulty:"easy",
    question:"What is the least common multiple (LCM) of 4 and 6?",
    options:["A) 2","B) 12","C) 24","D) 10"], correct:"B",
    explanation:"Multiples of 4: 4, 8, 12, 16… Multiples of 6: 6, 12, 18… The smallest common multiple is 12." },

  { id:89, testType:"ACT", section:"Math", topic:"Coordinate Geometry", difficulty:"medium",
    question:"A line passes through (−2, 1) and (4, 4). What is its slope?",
    options:["A) 1/2","B) 2","C) 3/6","D) 1"], correct:"A",
    explanation:"Slope = (4 − 1) / (4 − (−2)) = 3 / 6 = 1/2." },

  { id:90, testType:"ACT", section:"Math", topic:"Trigonometry", difficulty:"medium",
    question:"In a right triangle, cos(θ) = 3/5. What is sin(θ)?",
    options:["A) 3/4","B) 4/5","C) 5/3","D) 5/4"], correct:"B",
    explanation:"If cos(θ) = adj/hyp = 3/5, then adj = 3 and hyp = 5. By Pythagorean theorem: opp = √(25 − 9) = √16 = 4. So sin(θ) = opp/hyp = 4/5." },

  // ── MORE SAT MATH ─────────────────────────────────────────────────────────
  { id:91, testType:"SAT", section:"Math", topic:"Data Analysis", difficulty:"hard",
    question:"A scatterplot shows hours studied (x) vs. test score (y). The line of best fit is y = 5x + 55. What does the y-intercept represent?",
    options:["A) The score increases by 55 for each hour studied","B) A student who studied 0 hours is predicted to score 55","C) The maximum possible score is 55","D) A student must study 55 hours to pass"], correct:"B",
    explanation:"The y-intercept (55) is the predicted score when x = 0 — i.e., a student who studied 0 hours. The slope (5) represents the score increase per hour studied." },

  { id:92, testType:"SAT", section:"Math", topic:"Quadratics", difficulty:"hard",
    question:"If (x − 3)² = 16, what are the values of x?",
    options:["A) x = 7 or x = −1","B) x = 7 only","C) x = 4 or x = −4","D) x = 19 or x = −13"], correct:"A",
    explanation:"Take the square root of both sides: x − 3 = ±4. So x = 3 + 4 = 7 or x = 3 − 4 = −1." },

  { id:93, testType:"SAT", section:"Math", topic:"Functions", difficulty:"hard",
    question:"The function f is defined by f(x) = 2x + 1. What is f(f(3))?",
    options:["A) 7","B) 14","C) 15","D) 8"], correct:"C",
    explanation:"f(3) = 2(3) + 1 = 7. Then f(f(3)) = f(7) = 2(7) + 1 = 15." },

  { id:94, testType:"SAT", section:"Math", topic:"Geometry", difficulty:"medium",
    question:"Two angles of a triangle measure 47° and 68°. What is the measure of the third angle?",
    options:["A) 55°","B) 65°","C) 75°","D) 85°"], correct:"B",
    explanation:"Angles in a triangle sum to 180°. Third angle = 180° − 47° − 68° = 65°." },

  { id:95, testType:"SAT", section:"Math", topic:"Rates and Ratios", difficulty:"hard",
    question:"A tank fills at 8 gallons per minute and drains at 3 gallons per minute. The tank holds 200 gallons. Starting empty with both open, how many minutes to fill completely?",
    options:["A) 25 min","B) 40 min","C) 66.7 min","D) 200 min"], correct:"B",
    explanation:"Net fill rate = 8 − 3 = 5 gallons/min. Time = 200 ÷ 5 = 40 minutes." },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

// Sections that belong exclusively to one test
const SECTION_TEST_MAP = { English:'ACT', Science:'ACT', Writing:'SAT' };

function inferTestType(section, currentTestType) {
  if (!section) return currentTestType;
  if (SECTION_TEST_MAP[section]) return SECTION_TEST_MAP[section];
  return currentTestType;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuestions({ testType, section, topic, difficulty, count = 10, seenIds = [] } = {}) {
  // Auto-correct testType when section implies a specific test
  const effectiveTestType = inferTestType(section, testType);

  let pool = [...QUESTIONS];
  if (effectiveTestType && effectiveTestType !== 'BOTH') {
    pool = pool.filter(q => q.testType === effectiveTestType || q.testType === 'BOTH');
  }
  if (section)    pool = pool.filter(q => q.section.toLowerCase() === section.toLowerCase());
  if (topic)      pool = pool.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
  if (difficulty) pool = pool.filter(q => q.difficulty === difficulty);

  // Prefer unseen questions; fall back to seen ones only if needed
  const unseen = pool.filter(q => !seenIds.includes(q.id));
  const seen   = pool.filter(q =>  seenIds.includes(q.id));

  const ordered = [...shuffle(unseen), ...shuffle(seen)];
  return ordered.slice(0, Math.min(count, ordered.length));
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
  const effectiveTestType = inferTestType(section, testType);
  if (effectiveTestType && effectiveTestType !== 'BOTH') {
    pool = pool.filter(q => q.testType === effectiveTestType || q.testType === 'BOTH');
  }
  if (section && section !== '') pool = pool.filter(q => q.section.toLowerCase() === section.toLowerCase());
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
