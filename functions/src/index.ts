/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import {ChatOpenAI} from "langchain/chat_models/openai";
import {ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate, PromptTemplate} from "langchain/prompts";

const app = express();
app.use(cors({origin: true}));
app.use(express.json());


exports.rhymeScheme = functions.https.onCall(async (data) => {
  if (!data.poem) {
    throw new functions.https.HttpsError("invalid-argument", "poem is required ...");
  }

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI,
    temperature: 1,
  });

  const rhymeSchemePrompt = new PromptTemplate({
    inputVariables: ["poem"],
    template: `You are a helpful poetry tutor that helps the student by finding the rhyme scheme of the given lines: {poem}.
    if the lines do not have any concrete rhyme scheme, please specify that, and recommend few lines that follow a 
    particular rhyme scheme, do not make stuff up if there is no concrete rhyme scheme, be as accurate as possible.`,
  });

  console.log(rhymeSchemePrompt.format({"poem": data.poem}));

  const rhymeSchemeResponse = await chat.generatePrompt([
    await rhymeSchemePrompt.formatPromptValue({
      poem: data.poem,
    }),
  ]);
  return {
    "result": rhymeSchemeResponse.generations[0][0].text,
    "tokens": rhymeSchemeResponse.llmOutput,
  };
});

exports.poeticMetreFinder = functions.https.onCall(async (data) => {
  if (!data.poem) {
    throw new functions.https.HttpsError("invalid-argument", "a poem is required ...");
  }
  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI,
    temperature: 0.9,
  });
  const template =
    `You are a helpful poetry tutor that highlights the metre of a given {poem},
    return the whole poem- for stressed syllables uppercase the syllables & for unstressed lowercase;
    write few sentences talking about it`;
  const poeticMetreFinderPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(template),
    HumanMessagePromptTemplate.fromTemplate("{poem}"),
  ]);
  console.log(poeticMetreFinderPrompt.format({"poem": data.poem}));
  const poeticMetreFinderResponse = await chat.generatePrompt([
    await poeticMetreFinderPrompt.formatPromptValue({
      poem: data.poem,
    }),
  ]);
  return {
    "result": poeticMetreFinderResponse.generations[0][0].text,
    "tokens": poeticMetreFinderResponse.llmOutput,
  };
});

exports.reviewTheFeatures = functions.https.onCall(async (data) => {
  if (!data.poem || !data.features) {
    throw new functions.https.HttpsError("invalid-argument", "a poem & features list is required ...");
  }

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
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
  console.log(reviewTheFeaturesPrompt.format({"poem": data.poem, "features": data.features}));

  const reviewTheFeaturesResponse = await chat.generatePrompt([
    await reviewTheFeaturesPrompt.formatPromptValue({
      poem: data.poem,
      features: data.features,
    }),
  ]);
  return {
    "result": reviewTheFeaturesResponse.generations[0][0].text,
    "tokens": reviewTheFeaturesResponse.llmOutput,
  };
});

exports.rhymeTwoSelectedLines = functions.https.onCall(async (data) => {
  if (!data.selectedLines) {
    throw new functions.https.HttpsError("invalid-argument", "Selected lines list is required ...");
  }

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
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
  console.log(rhymeTwoSelectedLinesPrompt.format({"selectedLines": data.selectedLines}));

  const rhymeTwoSelectedLinesResponse = await chat.generatePrompt([
    await rhymeTwoSelectedLinesPrompt.formatPromptValue({
      selectedLines: data.selectedLines,
    }),
  ]);
  return {
    "result": rhymeTwoSelectedLinesResponse.generations[0][0].text,
    "tokens": rhymeTwoSelectedLinesResponse.llmOutput,
  };
});

exports.generateQuickLines = functions.https.onCall(async (data) => {
  if (!data.previousLine || !data.nextLines || !data.previousLines || !data.features) {
    throw new functions.https.HttpsError("invalid-argument", "Previous lines list, next lines, previous line & features are required ...");
  }

  const form = data.features[0];
  const syllables = data.features[1];
  const rhyme = data.features[2];

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
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
  console.log(generateQuickLinesPrompt.format({
    "previousLine": data.previousLine,
    "nextLines": data.nextLines,
    "previousLines": data.previousLines,
    "form": form,
    "syllables": syllables,
    "rhyme": rhyme,
  }));

  const generateQuickLinesResponse = await chat.generatePrompt([
    await generateQuickLinesPrompt.formatPromptValue({
      previousLine: data.previousLine,
      nextLines: data.nextLines,
      previousLines: data.previousLines,
      form: data.form,
      syllables: data.syllables,
      rhyme: data.rhyme,
    }),
  ]);
  return {
    "result": generateQuickLinesResponse.generations[0][0].text,
    "tokens": generateQuickLinesResponse.llmOutput,
  };
});

exports.changeLinesToFollowMetre = functions.https.onCall(async (data) => {
  if (!data.lines || !data.metreFeature) {
    throw new functions.https.HttpsError("invalid-argument", "lines & metre feature is required ...");
  }

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
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
  return {
    "result": changeLinesToFollowMetreResponse.generations[0][0].text,
    "tokens": changeLinesToFollowMetreResponse.llmOutput,
  };
});

exports.generateFewLinesForInspiration = functions.https.onCall(async (data) => {
  if (!data.lines) {
    throw new functions.https.HttpsError("invalid-argument", "lines are required ...");
  }

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI,
    temperature: 1,
  });

  const generateFewLinesForInspirationPrompt = new PromptTemplate({
    inputVariables: ["lines"],
    template: `You are a helpful poetry tutor that helps the student by generating few lines
    for inspiration, try to inspire your student by just generating a few lines based on the {lines} provided to you for context,
    make sure to follow the style of the lines provided to you, try to be as inspirational as possible 
    but to not diverge from the context of the lines given to you for context.`,
  });

  console.log(generateFewLinesForInspirationPrompt.format({"lines": data.lines}));

  const generateFewLinesForInspirationResponse = await chat.generatePrompt([
    await generateFewLinesForInspirationPrompt.formatPromptValue({
      lines: data.lines,
    }),
  ]);
  return {
    "result": generateFewLinesForInspirationResponse.generations[0][0].text,
    "tokens": generateFewLinesForInspirationResponse.llmOutput,
  };
});

exports.getInspired = functions.https.onCall(async (data) => {
  if (!data.lines) {
    throw new functions.https.HttpsError("invalid-argument", "lines are required ...");
  }

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI,
    temperature: 1,
  });

  const getInspiredPrompt = new PromptTemplate({
    inputVariables: ["lines"],
    template: `You are a helpful poetry tutor that helps the student by helping them get inspired to unleash their 
    creativity,   tell any trivia or some anecdote or advice based on their poetry: 
    {lines}, suggest poets that match the vibe of their poetry. Respond in less than 125 words approx.`,
  });

  console.log(getInspiredPrompt.format({"lines": data.lines}));

  const getInspiredResponse = await chat.generatePrompt([
    await getInspiredPrompt.formatPromptValue({
      lines: data.lines,
    }),
  ]);
  return {
    "result": getInspiredResponse.generations[0][0].text,
    "tokens": getInspiredResponse.llmOutput,
  };
});
