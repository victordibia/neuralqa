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
      appname: "NeuralQA",
      appdescription: "Question Answering on Large Datasets",
    },
    queryview: {
      intro: {
        title: "NeuralQA: Question Answering on Large Datasets",
        subtitle:
          "NeuralQA is an interactive tool for question answering (passage retrieval + document reading). You can manually provide a passage or select a search index from (e.g. case.law ) dataset under the QA configuration settings below. To begin, type in a question query below.",
        disclaimer: " .. ",
      },
      views: {
        intro: true,
        advanced: true,
        samples: true,
        passages: true,
        explanations: true,
        allanswers: false,
        expander: false,
      },
      options: {
        stride: {
          title: "Token Stride",
          selected: 0,
          options: [
            { name: 0, value: 0 },
            { name: 50, value: 50 },
            { name: 100, value: 100 },
            { name: 200, value: 200 },
          ],
        },
        maxdocuments: {
          title: "Max Documents",
          selected: 5,
          options: [
            { name: 5, value: 5 },
            { name: 10, value: 10 },
            { name: 15, value: 15 },
          ],
        },
        fragmentsize: {
          title: "Fragment Size",
          selected: 350,
          options: [
            { name: 350, value: 350 },
            { name: 450, value: 450 },
            { name: 650, value: 650 },
            { name: 850, value: 850 },
          ],
        },
        relsnip: {
          title: "Relsnip",
          selected: true,
          options: [
            { name: true, value: true },
            { name: false, value: false },
          ],
        },
        samples: [
          {
            question: "what is the goal of the fourth amendment?  ",
            context:
              "The Fourth Amendment of the U.S. Constitution provides that the right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized.'The ultimate goal of this provision is to protect people’s right to privacy and freedom from unreasonable intrusions by the government. However, the Fourth Amendment does not guarantee protection from all searches and seizures, but only those done by the government and deemed unreasonable under the law.",
          },
          {
            question:
              "Who was the first woman to serve on the supreme court in America",
            context:
              "Sandra Day O’Connor, née Sandra Day, (born March 26, 1930, El Paso, Texas, U.S.), associate justice of the Supreme Court of the United States from 1981 to 2006. She was the first woman to serve on the Supreme Court. A moderate conservative, she was known for her dispassionate and meticulously researched opinions. Sandra Day grew up on a large family ranch near Duncan, Arizona. She received undergraduate (1950) and law (1952) degrees from Stanford University, where she met the future chief justice of the United States William Rehnquist.",
          },
          {
            question: "Where did Sandra Day grow up?",
            context:
              "Sandra Day O’Connor, née Sandra Day, (born March 26, 1930, El Paso, Texas, U.S.), associate justice of the Supreme Court of the United States from 1981 to 2006. She was the first woman to serve on the Supreme Court. A moderate conservative, she was known for her dispassionate and meticulously researched opinions. Sandra Day grew up on a large family ranch near Duncan, Arizona. She received undergraduate (1950) and law (1952) degrees from Stanford University, where she met the future chief justice of the United States William Rehnquist.",
          },
        ],
        expander: {
          title: "Expander",
          selected: "none",
          options: [
            { name: "None", value: "none", type: "none" },
            {
              name: "Masked LM",
              type: "maskedlm",
              value: "distilbert-base-uncased",
            },
          ],
        },
        reader: {
          title: "Reader",
          selected: "twmkn9/distilbert-base-uncased-squad2",
          options: [
            {
              name: "DistilBERT SQUAD2",
              value: "twmkn9/distilbert-base-uncased-squad2",
              type: "distilbert",
            },
            {
              name: "BERT SQUAD2",
              value: "deepset/bert-base-cased-squad2",
              type: "bert",
            },
            {
              name: "Medical BERT SQUAD2",
              value: "/Users/victordibia/Downloads/meddistilbert",
              type: "bert",
            },
          ],
        },
        retriever: {
          title: "Retriever",
          selected: "none",
          options: [
            { name: "None", value: "none", type: "none" },
            {
              name: "Case Law",
              value: "cases",
              host: "localhost",
              port: 9200,
              username: "None",
              password: "None",
              type: "elasticsearch",
              fields: { body_field: "casebody.data.opinions.text" },
            },
            {
              name: "Medical",
              value: "medical",
              host: "localhost",
              port: 9200,
              username: "None",
              password: "None",
              type: "elasticsearch",
              fields: { body_field: "context" },
            },
            {
              name: "Supreme Court",
              value: "supremecourt",
              host: "localhost",
              port: 9200,
              username: "None",
              password: "None",
              type: "elasticsearch",
              fields: { body_field: "casebody" },
            },
          ],
          readtopn: 0,
        },
      },
    },
  };
}
