// Function to fetch questions from the API
const fetchQuestions = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map(question => ({
            question: question.question,
            options: shuffle([...question.incorrect_answers, question.correct_answer]),
            correctAnswer: question.correct_answer,
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
};

// Shuffle the options array to randomize answer order
const shuffle = (array) => array.sort(() => Math.random() - 0.5);

let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let quizQuestions = [];
let hasSelectedAnswer = false;

// Function to initialize the quiz
const initQuiz = async () => {
    try {
        // Fetch questions from the API
        quizQuestions = await fetchQuestions('https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple');
        totalQuestions = quizQuestions.length;

        // Render the first question
        renderQuestion();
    } catch (error) {
        console.error('Error initializing quiz:', error);
    }
};

// Function to render the quiz questions
const renderQuestion = () => {
    hasSelectedAnswer = false;
    document.getElementById('next-btn').style.display = 'none';

    const { question, options } = quizQuestions[currentQuestionIndex];
    const quizContainer = document.getElementById('quiz-container');
    
    const optionsHTML = options
        .map((option, index) => `<button class="option" data-index="${index}">${option}</button>`)
        .join('');
    
    quizContainer.innerHTML = `<h2>${question}</h2><div class="options">${optionsHTML}</div>`;

    // Add event listeners to options
    document.querySelectorAll('.option').forEach(button => {
        button.addEventListener('click', checkAnswer);
    });
};

// Function to validate answer and track score
const checkAnswer = (event) => {
    if (hasSelectedAnswer) return;

    hasSelectedAnswer = true;
    const selectedOption = event.target;
    const correctAnswer = quizQuestions[currentQuestionIndex].correctAnswer;

    if (selectedOption.innerText === correctAnswer) {
        score++;
        selectedOption.classList.add('correct');
    } else {
        selectedOption.classList.add('wrong');
        // Show the correct answer
        document.querySelectorAll('.option').forEach(button => {
            if (button.innerText === correctAnswer) {
                button.classList.add('correct');
            }
        });
    }

    // Disable all buttons after answer selection
    document.querySelectorAll('.option').forEach(button => {
        button.disabled = true;
    });

    // Show next button
    document.getElementById('next-btn').style.display = 'block';
};

// Function to display the final score and end the quiz
const endQuiz = () => {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `<h2>Your Score: ${score}/${totalQuestions}</h2>`;
    document.getElementById('next-btn').style.display = 'none';

    // Store the score in localStorage
    localStorage.setItem('quizScore', score);
    localStorage.setItem('quizTotalQuestions', totalQuestions);
};

// Next button event listener
document.getElementById('next-btn').addEventListener('click', () => {
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        endQuiz();
    }
});

// Initialize the quiz when the page loads
window.addEventListener('load', initQuiz);

// Display the saved score from localStorage, if any
const savedScore = localStorage.getItem('quizScore');
const savedTotalQuestions = localStorage.getItem('quizTotalQuestions');

if (savedScore && savedTotalQuestions) {
    document.getElementById('score').innerText = `Last Score: ${savedScore}/${savedTotalQuestions}`;
}
