/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, PromptTemplate} from "langchain/prompts";

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

exports.addNumbers = functions.https.onCall((data) => {
  if (!data.num1 || !data.num2) {
    throw new functions.https.HttpsError("invalid-argument", "'num1' and 'num2' are required.");
  }

  const result = data.num1 + data.num2;

  return {result};
});

exports.poeticMetreFinder = functions.https.onCall(async (data) => {
  if (!data.poem) {
    throw new functions.https.HttpsError("invalid-argument", "a poem is required ...");
  }
  const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI,
    temperature: 0.9,
  });
  const template =
    `You are a helpful poetry tutor that highlights the metre of a given {poem},'
    return the whole poem- for stressed syllables uppercase the syllables & for unstressed lowercase;
    write few sentences talking about it`;
  const poeticMetreFinderPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(template),
    HumanMessagePromptTemplate.fromTemplate("{poem}"),
  ]);
  console.log(poeticMetreFinderPrompt);
  const poeticMetreFinderResponse = await chat.generatePrompt([
    await poeticMetreFinderPrompt.formatPromptValue({
      poem: data.poem,
    }),
  ]);
  return {"result": poeticMetreFinderResponse.generations[0][0].text};
});

exports.reviewTheFeatures = functions.https.onCall(async (data) => {
  if (!data.poem || !data.features) {
    throw new functions.https.HttpsError("invalid-argument", "a poem & features list is required ...");
  }

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI,
    temperature: 1,
  });

  const template =
  `You are a helpful poetry tutor that guides the user to follow the correct poetry features.
  These are the features in a list: {features}
  try to make sure your student follows the features for the {poem}`;
  const reviewTheFeaturesPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(template),
    HumanMessagePromptTemplate.fromTemplate("{poem}"),
  ]);
  console.log(reviewTheFeaturesPrompt);

  const reviewTheFeaturesResponse = await chat.generatePrompt([
    await reviewTheFeaturesPrompt.formatPromptValue({
      poem: data.poem,
      features: data.features,
    }),
  ]);
  return {"result": reviewTheFeaturesResponse.generations[0][0].text};
});

exports.rhymeTwoSelectedLines = functions.https.onCall(async (data) => {
  if (!data.selectedLines) {
    throw new functions.https.HttpsError("invalid-argument", "Selected lines list is required ...");
  }

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI,
    temperature: 1,
  });

  const template =
  `You are a helpful poetry tutor that helps the student in rhyming two lines of poetry; you rhyme these {selectedLines}, 
  rhyme these lines without changing the meaning, metre, structure of the two lines, return two lines which totally rhyme`;
  const rhymeTwoSelectedLinesPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(template),
    HumanMessagePromptTemplate.fromTemplate("{selectedLines}"),
  ]);
  console.log(rhymeTwoSelectedLinesPrompt);

  const rhymeTwoSelectedLinesResponse = await chat.generatePrompt([
    await rhymeTwoSelectedLinesPrompt.formatPromptValue({
      selectedLines: data.selectedLines,
    }),
  ]);
  return {"result": rhymeTwoSelectedLinesResponse.generations[0][0].text};
});

exports.generateQuickLines = functions.https.onCall(async (data) => {
  if (!data.previousLine || !data.nextLines || !data.previousLines || !data.features) {
    throw new functions.https.HttpsError("invalid-argument", "Previous lines list, next lines, previous line & features are required ...");
  }

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI,
    temperature: 1,
  });

  const template =
  `You are a helpful AI poet. You have to generate poetry lines from the current line. 
  These are the previous lines: {previousLines}, 
  these are the next lines: {nextLines}.
  These are the rules you should follow strictly:
  1. The form should be: {form}; 
  2. Count the syllables make sure they are EXACTLY {syllables}, the syllable count should be exactly {syllables}'
  3. The rhyme scheme pattern should be strictly: {rhyme}.
  Generate exactly between 5 to 8 lines (NOT MORE THAN THAT!), without labelling or numbering them`;
  const generateQuickLinesPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(template),
    HumanMessagePromptTemplate.fromTemplate("{previousLines}"),
  ]);
  console.log(generateQuickLinesPrompt);

  const generateQuickLinesResponse = await chat.generatePrompt([
    await generateQuickLinesPrompt.formatPromptValue({
      previousLine: data.previousLine,
      nextLines: data.nextLines,
      previousLines: data.previousLines,
      features: data.features,
    }),
  ]);
  return {"result": generateQuickLinesResponse.generations[0][0].text};
});

exports.changeLinesToFollowMetre = functions.https.onCall(async (data) => {
  if (!data.lines || !data.metreFeature) {
    throw new functions.https.HttpsError("invalid-argument", "lines & metre feature is required ...");
  }

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI,
    temperature: 1,
  });

  const changeLinesToFollowMetrePrompt = new PromptTemplate({
    inputVariables: ["lines", "metreFeature"],
    template: `You are a helpful poetry tutor that helps the student in converting the following lines: "{lines}" of poetry to {metreFeature};
    you make sure the "{lines}" follow the required {metreFeature} metre, without chaning the meaning of the lines`,
  });

  console.log(changeLinesToFollowMetrePrompt.format({"metreFeature": data.metreFeature, "lines": data.lines}));

  const changeLinesToFollowMetreResponse = await chat.generatePrompt([
    await changeLinesToFollowMetrePrompt.formatPromptValue({
      metreFeature: data.metreFeature,
      lines: data.lines,
    }),
  ]);
  return {"result": changeLinesToFollowMetreResponse.generations[0][0].text};
});
