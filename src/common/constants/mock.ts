export const vocabularies = [
  'goodbye',
  'dreading',
  'finally',
  'efforts',
  'inevitable',
  'normal',
  'decided',
  'expend',
  'bring',
];

export const grammars = [
  {
    sentence: 'The time had come for Nancy to say goodbye.',
    grammars: ['Past Perfect', 'Modal in the past'],
  },
  {
    sentence:
      'She had been dreading this moment for a good six months, and it had finally arrived despite her best efforts to forestall it.',
    grammars: ['Past Perfect Continuous', 'Mixed conditionals in the past'],
  },
  {
    sentence:
      "No matter how hard she tried, she couldn't keep the inevitable from happening.",
    grammars: ['Inversion with negative adverbials', 'Modals in the past'],
  },
  {
    sentence:
      'So the time had come for a normal person to say goodbye and move on.',
    grammars: ['Past Perfect', 'Narrative tenses for experience'],
  },
  {
    sentence:
      'It was at this moment that Nancy decided not to be a normal person.',
    grammars: ['Past Simple'],
  },
  {
    sentence:
      "After all the time and effort she had expended, she couldn't bring herself to do it.",
    grammars: ['Mixed conditionals in the past', 'Included passive'],
  },
];

export const fullMockLesson = {
  grammars: [
    {
      name: 'Modals of deduction and speculation',
      usage:
        'Modals of Deduction and Speculation are used to make guesses or draw conclusions about past or present situations',
      exampleMeta: ['She must have forgotten about the meeting.'],
    },
    {
      name: 'Past simple',
      usage:
        'Past Simple is used to describe actions that happened at a specific time in the past',
      exampleMeta: ['I went to the park yesterday.'],
    },
    {
      name: 'Passive voice',
      usage:
        'Passive Voice is used when the focus is on the action rather than the doer of the action',
      exampleMeta: ['The cake was baked by my mom.'],
    },
  ],
  vocabularies: [
    {
      word: 'composure',
      meaning: 'calmness especially of mind, manner, or appearance',
      exampleMeta: ['She maintained her composure even under pressure.'],
      antonymMeta: ['agitation', 'discomposure', 'perturbation'],
      synonymMeta: ['aplomb', 'calmness', 'collectedness'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/c/compos13.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png',
    },
    {
      word: 'confidence',
      meaning: 'a feeling of trust or belief',
      exampleMeta: ['He spoke with confidence during the presentation.'],
      antonymMeta: ['diffidence', 'self-doubt', 'doubt'],
      synonymMeta: ['aplomb', 'assurance', 'self-assurance'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/c/confid04.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/3755918/pexels-photo-3755918.jpeg',
    },
    {
      word: 'practice',
      meaning: 'to perform or work at over and over so as to become skilled',
      exampleMeta: ['She needs to practice the piano every day to improve.'],
      antonymMeta: [],
      synonymMeta: ['dry run', 'rehearsal', 'trial'],
      pronunciationAudio: null,
      functionalLabel: 'verb',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/974498/pexels-photo-974498.jpeg',
    },
    {
      word: 'threat',
      meaning: 'an expression of an intent to do harm',
      exampleMeta: [
        'The dark clouds in the sky are a threat of a coming storm.',
      ],
      antonymMeta: [],
      synonymMeta: ['danger', 'hazard', 'menace'],
      pronunciationAudio: null,
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/19160390/pexels-photo-19160390.jpeg',
    },
    {
      word: 'struggle',
      meaning:
        'to make a great effort to overcome someone or something : strive',
      exampleMeta: ['Despite the struggle, she never gave up on her dream.'],
      antonymMeta: [],
      synonymMeta: ['battle', 'fight', 'fray'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/s/strugg01.mp3',
      functionalLabel: 'verb',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/9463866/pexels-photo-9463866.jpeg',
    },
    {
      word: 'serve',
      meaning: 'to be a servant',
      exampleMeta: ['The waiter will serve us our meals at the restaurant.'],
      antonymMeta: [],
      synonymMeta: ['slave (for)', 'work (for)', 'do'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/s/serve001.mp3',
      functionalLabel: 'verb',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/1267257/pexels-photo-1267257.jpeg',
    },
    {
      word: 'comeback',
      meaning: 'retort',
      exampleMeta: [
        'After trailing in the game, they made a remarkable comeback to win.',
      ],
      antonymMeta: ['inquiry', 'query', 'question'],
      synonymMeta: ['repartee', 'retort', 'riposte'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/c/comeba01.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png',
    },
    {
      word: 'determination',
      meaning:
        'the act of coming to a decision; also : the decision or conclusion reached',
      exampleMeta: [
        'With determination, she was able to overcome all obstacles.',
      ],
      antonymMeta: ['hesitation', 'indecision', 'irresolution'],
      synonymMeta: ['decidedness', 'decision', 'decisiveness'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/d/determ07.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/3820380/pexels-photo-3820380.jpeg',
    },
    {
      word: 'injury',
      meaning: 'an act that damages or hurts : wrong',
      exampleMeta: ['He suffered a serious injury while playing basketball.'],
      antonymMeta: ['justice'],
      synonymMeta: ['damage', 'detriment', 'harm'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/i/injury01.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/7298636/pexels-photo-7298636.jpeg',
    },
    {
      word: 'inconsistent',
      meaning: 'not being in agreement or harmony : incompatible',
      exampleMeta: ['Her performance was inconsistent throughout the season.'],
      antonymMeta: ['agreeing', 'compatible', 'congruous'],
      synonymMeta: ['clashing', 'conflicting', 'disagreeing'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/i/incons14.mp3',
      functionalLabel: 'adjective',
      pronunciationWritten: null,
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png',
    },
    {
      word: 'nerves',
      meaning: 'tendon',
      exampleMeta: ['She always gets nervous before a big exam.'],
      antonymMeta: ['cowardice', 'cowardliness', 'cravenness'],
      synonymMeta: ['audacity', 'brashness', 'brass'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/n/nerve001.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/4750347/pexels-photo-4750347.jpeg',
    },
    {
      word: 'tournament',
      meaning:
        'a contest of skill and courage between knights wearing armor and fighting with blunted lances or swords',
      exampleMeta: [
        'The soccer team will compete in a tournament this weekend.',
      ],
      antonymMeta: [],
      synonymMeta: ['bout', 'competition', 'contest'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/t/tourna01.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/861464/pexels-photo-861464.jpeg',
    },
    {
      word: 'remarkable',
      meaning:
        'worthy of being or likely to be noticed especially as being uncommon or extraordinary',
      exampleMeta: [
        'It was a remarkable achievement to climb the highest mountain.',
      ],
      antonymMeta: ['inconspicuous', 'unemphatic', 'unnoticeable'],
      synonymMeta: ['bizarre', 'curious', 'far-out'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/r/remark02.mp3',
      functionalLabel: 'adjective',
      pronunciationWritten: null,
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/832px-No-Image-Placeholder.svg.png',
    },
    {
      word: 'performance',
      meaning: 'the doing of an action',
      exampleMeta: ['The band gave an incredible performance at the concert.'],
      antonymMeta: ['nonfulfillment', 'nonperformance'],
      synonymMeta: ['accomplishment', 'achievement', 'commission'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/p/perfor11.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: null,
      imageUrl:
        'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    },
  ],
};
