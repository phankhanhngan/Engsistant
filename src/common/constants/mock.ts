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
      id: '0b24885f-dec2-453b-891f-c53af9a9072d',
      word: 'remarkable',
      meaning:
        'worthy of being or likely to be noticed especially as being uncommon or extraordinary',
      exampleMeta: [
        'It was a remarkable achievement for someone so young.',
        'The team made a remarkable comeback.',
      ],
      antonymMeta: ['inconspicuous', 'unemphatic', 'unnoticeable'],
      synonymMeta: ['bizarre', 'curious', 'far-out'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/r/remark02.mp3',
      functionalLabel: 'adjective',
      pronunciationWritten: 'ri-ˈmär-kə-bəl',
    },
    {
      id: '2116da32-bb30-434c-85c8-d7bcf1c1a76f',
      word: 'nerves',
      meaning: 'tendon',
      exampleMeta: [
        'His nerves got the best of him during the presentation.',
        'She had to calm her nerves before the big game.',
      ],
      antonymMeta: ['cowardice', 'cowardliness', 'cravenness'],
      synonymMeta: ['audacity', 'brashness', 'brass'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/n/nerve001.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: 'ˈnərv',
    },
    {
      id: '2e515b3b-7b88-4c25-ac12-f16cf1fc3d47',
      word: 'struggle',
      meaning:
        'to make a great effort to overcome someone or something : strive',
      exampleMeta: [
        'Many students struggle with math at first.',
        'It is a struggle to make ends meet.',
      ],
      antonymMeta: ['cakewalk', 'picnic', 'snap'],
      synonymMeta: ['battle', 'fight', 'fray'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/s/strugg01.mp3',
      functionalLabel: 'verb',
      pronunciationWritten: 'ˈstrəg-əl',
    },
    {
      id: '3feab961-c46e-488e-993f-608991779a04',
      word: 'tournament',
      meaning:
        'a contest of skill and courage between knights wearing armor and fighting with blunted lances or swords',
      exampleMeta: [
        'She won the tennis tournament last weekend.',
        'My company is sponsoring a golf tournament.',
      ],
      antonymMeta: ['noncompetition', 'noncontest', 'nonmatch'],
      synonymMeta: ['bout', 'competition', 'contest'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/t/tourna01.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: 'ˈtu̇r-nə-mənt',
    },
    {
      id: '414c3aed-ee22-4b30-84c8-03c352751011',
      word: 'practice',
      meaning: 'to perform or work at over and over so as to become skilled',
      exampleMeta: [
        'If you want to get better at basketball, you need to practice every day.',
        'She practices the piano for two hours every day.',
      ],
      antonymMeta: ['abstention', 'inaction', 'inactivity'],
      synonymMeta: ['dry run', 'rehearsal', 'trial'],
      pronunciationAudio: null,
      functionalLabel: 'verb',
      pronunciationWritten: null,
    },
    {
      id: '5391b360-ee99-40ee-ae92-e029e63ab5cf',
      word: 'threat',
      meaning: 'an expression of an intent to do harm',
      exampleMeta: [
        'The dark clouds in the sky were a threat of an incoming storm.',
        'The company received a threat from a competitor.',
      ],
      antonymMeta: ['promise', 'assurance', 'guarantee'],
      synonymMeta: ['danger', 'hazard', 'menace'],
      pronunciationAudio: null,
      functionalLabel: 'noun',
      pronunciationWritten: 'ˈthret',
    },
    {
      id: '6afe2575-1e69-4454-8345-7dc996db4131',
      word: 'inconsistent',
      meaning: 'not being in agreement or harmony : incompatible',
      exampleMeta: [
        'Her performance has been inconsistent lately.',
        'The data is inconsistent with the hypothesis.',
      ],
      antonymMeta: ['agreeing', 'compatible', 'congruous'],
      synonymMeta: ['clashing', 'conflicting', 'disagreeing'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/i/incons14.mp3',
      functionalLabel: 'adjective',
      pronunciationWritten: 'ˌin-kən-ˈsis-tənt',
    },
    {
      id: '744bb72d-d686-48bd-998c-2ddd84a7878a',
      word: 'injury',
      meaning: 'an act that damages or hurts : wrong',
      exampleMeta: [
        'He had to sit out the game due to an injury.',
        'The injury was severe.',
      ],
      antonymMeta: ['justice'],
      synonymMeta: ['damage', 'detriment', 'harm'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/i/injury01.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: 'ˈinj-(ə-)rē',
    },
    {
      id: '7f974f07-a3a5-445f-81fa-ee3623a46b5a',
      word: 'confidence',
      meaning: 'a feeling of trust or belief',
      exampleMeta: [
        'Having confidence in yourself is key to success.',
        ' She has confidence in her team.',
      ],
      antonymMeta: ['diffidence', 'self-doubt', 'doubt'],
      synonymMeta: ['aplomb', 'assurance', 'self-assurance'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/c/confid04.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: 'ˈkän-fəd-ən(t)s',
    },
    {
      id: '8a348dce-3389-45d5-9c92-8f91ced5c816',
      word: 'composure',
      meaning: 'calmness especially of mind, manner, or appearance',
      exampleMeta: [
        'Even under pressure, she maintained her composure.',
        'He regained his composure after the accident.',
      ],
      antonymMeta: ['agitation', 'discomposure', 'perturbation'],
      synonymMeta: ['aplomb', 'calmness', 'collectedness'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/c/compos13.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: 'kəm-ˈpō-zhər',
    },
    {
      id: '92f4f32b-ecef-4f33-ae60-5aad5e441934',
      word: 'performance',
      meaning: 'the doing of an action',
      exampleMeta: [
        'The band put on an amazing performance at the concert.',
        'The performance of the team was outstanding.',
      ],
      antonymMeta: ['nonfulfillment', 'nonperformance'],
      synonymMeta: ['accomplishment', 'achievement', 'commission'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/p/perfor11.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: 'pə(r)-ˈfȯr-mən(t)s',
    },
    {
      id: '9364b04a-5b13-4726-8125-cf68a647a122',
      word: 'serve',
      meaning: 'to be a servant',
      exampleMeta: [
        'The waiter will serve us our food shortly.',
        'She served as the team captain for two years.',
      ],
      antonymMeta: [],
      synonymMeta: ['slave (for)', 'work (for)', 'do'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/s/serve001.mp3',
      functionalLabel: 'verb',
      pronunciationWritten: 'ˈsərv',
    },
    {
      id: 'a9d9ddb6-3efa-4502-b95c-32688ce4fc2d',
      word: 'determination',
      meaning:
        'the act of coming to a decision; also : the decision or conclusion reached',
      exampleMeta: [
        'With sheer determination, he completed the marathon.',
        'She made a determination to finish the project by the deadline.',
      ],
      antonymMeta: ['hesitation', 'indecision', 'irresolution'],
      synonymMeta: ['decidedness', 'decision', 'decisiveness'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/d/determ07.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: 'di-ˌtər-mə-ˈnā-shən',
    },
    {
      id: 'd94bdea3-1141-4151-94d8-fee06863c418',
      word: 'comeback',
      meaning: 'retort',
      exampleMeta: [
        'After being behind, the team made an impressive comeback in the second half.',
        'She made a witty comeback to his comment.',
      ],
      antonymMeta: ['inquiry', 'query', 'question'],
      synonymMeta: ['repartee', 'retort', 'riposte'],
      pronunciationAudio:
        'https://media.merriam-webster.com/audio/prons/en/us/mp3/c/comeba01.mp3',
      functionalLabel: 'noun',
      pronunciationWritten: 'ˈkəm-ˌbak',
    },
  ],
};
