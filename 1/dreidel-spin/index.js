const dreidel_outcomes = [
    {
        "he": "נ",
        "la": "Nun"
    },
    {
        "he": "ג",
        "la": "Gimmel"
    },
    {
        "he": "ה",
        "la": "Hay"
    },
    {
        "he": "ש",
        "la": "Shin"
    }
];

function shuffleArray(to_shuffle) {
    // Accepts an argument "array", copies it, 
    // shuffles it, returns the result.
    let array = [...to_shuffle];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function spinDreidel() {
    // "Randomly" selects a dreidel side to return, 
    // returning hebrew and latin alphabet representations of
    // the character returned.
    const shuffled_dreidel_faces = shuffleArray(shuffleArray(dreidel_outcomes));
    return shuffled_dreidel_faces.pop();
}

module.exports = async function (context, req) {
    try {
        const response_body = spinDreidel();
        context.res = {
            status: 200,
            body: JSON.stringify(response_body)
        };
    } catch(e) {
        const response_body = {"message": "An error occured" + e};
        context.res = {
            status: 500,
            body: JSON.stringify(response_body)
        }
    }
};