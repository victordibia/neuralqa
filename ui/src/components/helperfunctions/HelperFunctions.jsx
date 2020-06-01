

import * as d3 from "d3"

export function abbreviateString(value, maxLength) {
    if (value.length <= maxLength) {
        return value
    } else {
        let retval = value.substring(0, maxLength) + ".."
        return retval
    }
}


function intlFormat(num) {
    return new Intl.NumberFormat().format(Math.round(num * 10) / 10);
}
export function makeFriendly(num) {
    if (num < 1 && num > 0) {
        return num
    }
    if (Math.abs(num) >= 1000000)
        return intlFormat(num / 1000000) + 'M';
    if (Math.abs(num) >= 1000)
        return intlFormat(num / 1000) + 'k';
    return intlFormat(num);
}

export function getJSONData(url) {
    return fetch(url).then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        return response.json().then(function (data) {
            return data
        });
    }).catch(function (err) {
        return Promise.reject(err)
    });
}


export function postJSONData(url, postData) {
    return fetch(url, {
        method: "post",
        body: JSON.stringify(postData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        return response.json().then(function (data) {
            return data
        });
    }).catch(function (err) {
        return Promise.reject(err)
    });
}

export function SampleQA() {
    let questions = [
        { question: "what is the goal of the fourth amendment?  ", context: "The Fourth Amendment of the U.S. Constitution provides that '[t]he right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized.'The ultimate goal of this provision is to protect people’s right to privacy and freedom from unreasonable intrusions by the government. However, the Fourth Amendment does not guarantee protection from all searches and seizures, but only those done by the government and deemed unreasonable under the law." },
        { question: "Who was the first woman to serve on the supreme court in America", context: "Sandra Day O’Connor, née Sandra Day, (born March 26, 1930, El Paso, Texas, U.S.), associate justice of the Supreme Court of the United States from 1981 to 2006. She was the first woman to serve on the Supreme Court. A moderate conservative, she was known for her dispassionate and meticulously researched opinions. Sandra Day grew up on a large family ranch near Duncan, Arizona. She received undergraduate (1950) and law (1952) degrees from Stanford University, where she met the future chief justice of the United States William Rehnquist. Upon her graduation she married a classmate, John Jay O’Connor III. Unable to find employment in a law firm because she was a woman—despite her academic achievements, one firm offered her a job as a secretary—she became a deputy district attorney in San Mateo county, California" },
        { question: "Where did Sandra day grow up?", context: "Sandra Day O’Connor, née Sandra Day, (born March 26, 1930, El Paso, Texas, U.S.), associate justice of the Supreme Court of the United States from 1981 to 2006. She was the first woman to serve on the Supreme Court. A moderate conservative, she was known for her dispassionate and meticulously researched opinions. Sandra Day grew up on a large family ranch near Duncan, Arizona. She received undergraduate (1950) and law (1952) degrees from Stanford University, where she met the future chief justice of the United States William Rehnquist. Upon her graduation she married a classmate, John Jay O’Connor III. Unable to find employment in a law firm because she was a woman—despite her academic achievements, one firm offered her a job as a secretary—she became a deputy district attorney in San Mateo county, California" },
        { question: "What school did Sandra day attend?", context: "Sandra Day O’Connor, née Sandra Day, (born March 26, 1930, El Paso, Texas, U.S.), associate justice of the Supreme Court of the United States from 1981 to 2006. She was the first woman to serve on the Supreme Court. A moderate conservative, she was known for her dispassionate and meticulously researched opinions. Sandra Day grew up on a large family ranch near Duncan, Arizona. She received undergraduate (1950) and law (1952) degrees from Stanford University, where she met the future chief justice of the United States William Rehnquist. Upon her graduation she married a classmate, John Jay O’Connor III. Unable to find employment in a law firm because she was a woman—despite her academic achievements, one firm offered her a job as a secretary—she became a deputy district attorney in San Mateo county, California" },
        { question: "what is the taj mahal made of?", context: "The Taj Mahal is an ivory-white marble mausoleum on the southern bank of the river Yamuna in the Indian city of Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan (reigned from 1628 to 1658) to house the tomb of his favourite wife, Mumtaz Mahal; it also houses the tomb of Shah Jahan himself. The tomb is the centrepiece of a 17-hectare (42-acre) complex, which includes a mosque and a guest house, and is set in formal gardens bounded on three sides by a crenellated wall. Construction of the mausoleum was essentially completed in 1643, but work continued on other phases of the project for another 10 years. The Taj Mahal complex is believed to have been completed in its entirety in 1653 at a cost estimated at the time to be around 32 million rupees, which in 2020 would be approximately 70 billion rupees (about U.S. $916 million). The construction project employed some 20,000 artisans under the guidance of a board of architects led by the court architect to the emperor. The Taj Mahal was designated as a UNESCO World Heritage Site in 1983 for being the jewel of Muslim art in India and one of the universally admired masterpieces of the world's heritage. It is regarded by many as the best example of Mughal architecture and a symbol of India's rich history. The Taj Mahal attracts 7–8 million visitors a year and in 2007, it was declared a winner of the New 7 Wonders of the World (2000–2007) initiative." },
        { question: "what was the cost for building the taj mahal?", context: "The Taj Mahal is an ivory-white marble mausoleum on the southern bank of the river Yamuna in the Indian city of Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan (reigned from 1628 to 1658) to house the tomb of his favourite wife, Mumtaz Mahal; it also houses the tomb of Shah Jahan himself. The tomb is the centrepiece of a 17-hectare (42-acre) complex, which includes a mosque and a guest house, and is set in formal gardens bounded on three sides by a crenellated wall. Construction of the mausoleum was essentially completed in 1643, but work continued on other phases of the project for another 10 years. The Taj Mahal complex is believed to have been completed in its entirety in 1653 at a cost estimated at the time to be around 32 million rupees, which in 2020 would be approximately 70 billion rupees (about U.S. $916 million). The construction project employed some 20,000 artisans under the guidance of a board of architects led by the court architect to the emperor. The Taj Mahal was designated as a UNESCO World Heritage Site in 1983 for being the jewel of Muslim art in India and one of the universally admired masterpieces of the world's heritage. It is regarded by many as the best example of Mughal architecture and a symbol of India's rich history. The Taj Mahal attracts 7–8 million visitors a year and in 2007, it was declared a winner of the New 7 Wonders of the World (2000–2007) initiative." },
        { question: "Who ruled macedonia ", context: "Macedonia was an ancient kingdom on the periphery of Archaic and Classical Greece, and later the dominant state of Hellenistic Greece. The kingdom was founded and initially ruled by the Argead dynasty, followed by the Antipatrid and Antigonid dynasties. Home to the ancient Macedonians, it originated on the northeastern part of the Greek peninsula. Before the 4th century BC, it was a small kingdom outside of the area dominated by the city-states of Athens, Sparta and Thebes, and briefly subordinate to Achaemenid Persia" },
        { question: "what are the symptoms of COVID-19", context: "COVID-19 is the infectious disease caused by the most recently discovered coronavirus. This new virus and disease were unknown before the outbreak began in Wuhan, China, in December 2019. The most common symptoms of COVID-19 are fever, tiredness, and dry cough. Some patients may have aches and pains, nasal congestion, runny nose, sore throat or diarrhea. These symptoms are usually mild and begin gradually. Some people become infected but don’t develop any symptoms and don't feel unwell. Most people (about 80%) recover from the disease without needing special treatment. Around 1 out of every 6 people who gets COVID-19 becomes seriously ill and develops difficulty breathing. Older people, and those with underlying medical problems like high blood pressure, heart problems or diabetes, are more likely to develop serious illness. People with fever, cough and difficulty breathing should seek medical attention." },
        { question: "what other medical conditions make COVID-19 worse?", context: "COVID-19 is the infectious disease caused by the most recently discovered coronavirus. This new virus and disease were unknown before the outbreak began in Wuhan, China, in December 2019. The most common symptoms of COVID-19 are fever, tiredness, and dry cough. Some patients may have aches and pains, nasal congestion, runny nose, sore throat or diarrhea. These symptoms are usually mild and begin gradually. Some people become infected but don’t develop any symptoms and don't feel unwell. Most people (about 80%) recover from the disease without needing special treatment. Around 1 out of every 6 people who gets COVID-19 becomes seriously ill and develops difficulty breathing. Older people, and those with underlying medical problems like high blood pressure, heart problems or diabetes, are more likely to develop serious illness. People with fever, cough and difficulty breathing should seek medical attention." }
    ]
    return questions
}


export function ColorArray() {
    let colorArray = [
        "#1f78b4",
        "#b2df8a",
        "#33a02c",
        "#fb9a99",
        "#e31a1c",
        "#fdbf6f",
        "#ff7f00",
        "#6a3d9a",
        "#cab2d6",
        "#ffff99",
        "#8fff4f"
    ]
    return colorArray
}

export function ColorExplanation(rowMin, rowMax, rowValue) {
    let color = d3.scaleQuantize()
        .domain([rowMin, rowMax])
        .range(['#d6604d',
            '#f4a582',
            '#fddbc7',
            '#f7f7f7',
            '#d1e5f0',
            '#92c5de',
            '#4393c3']);
    return color(rowValue)
}

export function ColorArrayRGB() {
    let colorArray = [
        [141, 211, 199],
        [255, 255, 179],
        [190, 186, 218],
        [251, 128, 114],
        [128, 177, 211],
        [253, 180, 98],
        [179, 222, 105],
        [252, 205, 229],
        [188, 128, 189],
        [204, 235, 197],
    ]
    return colorArray
}
export const explanationColor = d3.scaleQuantize()
    .domain([-0.5, 0.8])
    .range([
        '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d'
    ]);
export const probabilityColor = d3.scaleQuantize()
    .domain([0, 0.8])
    .range([
        '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d'
    ]);
