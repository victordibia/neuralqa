import * as d3 from "d3";

export function abbreviateString(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  } else {
    let retval = value.substring(0, maxLength) + "..";
    return retval;
  }
}

function intlFormat(num) {
  return new Intl.NumberFormat().format(Math.round(num * 10) / 10);
}
export function makeFriendly(num) {
  if (num < 1 && num > 0) {
    return num;
  }
  if (Math.abs(num) >= 1000000) return intlFormat(num / 1000000) + "M";
  if (Math.abs(num) >= 1000) return intlFormat(num / 1000) + "k";
  return intlFormat(num);
}

export function getJSONData(url) {
  return fetch(url)
    .then(function (response) {
      if (response.status !== 200) {
        console.log(
          "Looks like there was a problem. Status Code: " + response.status
        );
        return Promise.reject(response.status);
      }
      return response.json().then(function (data) {
        return data;
      });
    })
    .catch(function (err) {
      return Promise.reject(err);
    });
}

export function postJSONData(url, postData) {
  return fetch(url, {
    method: "post",
    body: JSON.stringify(postData),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      if (response.status !== 200) {
        console.log(
          "Looks like there was a problem. Status Code: " + response.status
        );
        return Promise.reject(response.status);
      }
      return response.json().then(function (data) {
        return data;
      });
    })
    .catch(function (err) {
      return Promise.reject(err);
    });
}

export function sampleConfig() {
  return {
    header: {
      appdescription: "Question Answering on Large Datasets",
      appname: "NeuralQA",
    },
    queryview: {
      intro: {
        disclaimer: " .. ",
        subtitle:
          "NeuralQA is an interactive tool for question answering (passage retrieval + document reading). You can manually provide a passage or select a search index from (e.g. case.law ) dataset under the QA configuration settings below. To begin, type in a question query below.",
        title: "NeuralQA: Question Answering on Large Datasets",
      },
      options: {
        expander: {
          options: [
            { name: "None", value: "none" },
            { name: "Synonyms", value: "synonyms" },
            { name: "Masked LM", value: "maskedlm" },
          ],
          selected: "None",
          title: "Expander",
        },
        highlightspan: {
          options: [
            { name: 150, value: 150 },
            { name: 250, value: 250 },
            { name: 350, value: 350 },
            { name: 450, value: 450 },
            { name: 650, value: 650 },
          ],
          selected: 250,
          title: "IR Highlight Span",
        },
        maxpassages: {
          options: [
            { name: 5, value: 5 },
            { name: 10, value: 10 },
            { name: 15, value: 15 },
          ],
          selected: 5,
          title: "Passages",
        },
        reader: {
          options: [
            {
              name: "DistilBERT SQUAD2",
              type: "distilbert",
              value: "twmkn9/distilbert-base-uncased-squad2",
            },
          ],
          selected: "twmkn9/distilbert-base-uncased-squad2",
          title: "Reader",
        },
        relsnip: {
          options: [
            { name: true, value: true },
            { name: false, value: false },
          ],
          selected: true,
          title: "Relsnip",
        },
        retriever: {
          options: [
            { name: "Manual", value: "manual" },
            {
              host: "localhost",
              name: "Case Law",
              password: "None",
              port: 9200,
              type: "elasticsearch",
              username: "None",
              value: "cases",
            },
          ],
          readtopn: 0,
          selected: "manual",
          title: "Retriever",
        },
        samples: [
          {
            context:
              "The Fourth Amendment of the U.S. Constitution provides that the right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized.'The ultimate goal of this provision is to protect people\u2019s right to privacy and freedom from unreasonable intrusions by the government. However, the Fourth Amendment does not guarantee protection from all searches and seizures, but only those done by the government and deemed unreasonable under the law.",
            question: "what is the goal of the fourth amendment?  ",
          },
          {
            context:
              "Sandra Day O\u2019Connor, n\u00e9e Sandra Day, (born March 26, 1930, El Paso, Texas, U.S.), associate justice of the Supreme Court of the United States from 1981 to 2006. She was the first woman to serve on the Supreme Court. A moderate conservative, she was known for her dispassionate and meticulously researched opinions. Sandra Day grew up on a large family ranch near Duncan, Arizona. She received undergraduate (1950) and law (1952) degrees from Stanford University, where she met the future chief justice of the United States William Rehnquist.",
            question:
              "Who was the first woman to serve on the supreme court in America",
          },
        ],
        stride: {
          options: [
            { name: 0, value: 0 },
            { name: 50, value: 50 },
            { name: 100, value: 100 },
            { name: 200, value: 200 },
          ],
          selected: 0,
          title: "Token Stride",
        },
      },
      samples: null,
      views: {
        advanced: true,
        allanswers: true,
        expander: false,
        explanations: true,
        intro: true,
        passages: true,
        samples: true,
      },
    },
  };
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
    "#8fff4f",
  ];
  return colorArray;
}

export function ColorExplanation(rowMin, rowMax, rowValue) {
  let color = d3
    .scaleQuantize()
    .domain([rowMin, rowMax])
    .range([
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#f7f7f7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
    ]);
  return color(rowValue);
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
  ];
  return colorArray;
}
export const explanationColor = d3
  .scaleQuantize()
  .domain([-0.5, 0.8])
  .range([
    "#4393c3",
    "#92c5de",
    "#d1e5f0",
    "#f7f7f7",
    "#fddbc7",
    "#f4a582",
    "#d6604d",
  ]);
export const probabilityColor = d3
  .scaleQuantize()
  .domain([0, 0.8])
  .range([
    "#4393c3",
    "#92c5de",
    "#d1e5f0",
    "#f7f7f7",
    "#fddbc7",
    "#f4a582",
    "#d6604d",
  ]);
