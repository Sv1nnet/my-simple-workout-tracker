/* eslint-disable max-len */

const exercises = [
  {
    id: '6709596b5c61afda0db52e93',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим штанги лежа',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежа на скамье, поднимайте штангу от груди вверх.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
      '675e00fc5d1f1d8d19f8e623', // Плечи: Передняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e94',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Приседания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '675decca0e6eababfa8226e7' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Опуститесь, как будто садитесь на стул, затем поднимитесь обратно.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e95',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Становая тяга',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Поднимите штангу с пола до уровня бедер, затем опустите обратно.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e620', // Спина: Выпрямляющая позвоночник мышца
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
      '675e00fc5d1f1d8d19f8e628', // Ноги: Бицепс бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e96',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '67633fc0ccc2d8f80ec3b09d' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Висите на перекладине и подтягивайте тело вверх, пока подбородок не окажется над перекладиной.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '6709596b5c61afda0db52e99',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Тяга штанги в наклоне',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Наклонитесь и подтяните штангу к нижней части груди.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e61e', // Спина: Ромбовидная мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e9a',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Разгибание рук на трицепс',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Опустите трос вниз, используя трицепсы.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e9b',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем гантелей на бицепс',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '67633fc0ccc2d8f80ec3b09d' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Поднимайте гантели к плечам, сгибая руки.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
      '675e00fc5d1f1d8d19f8e633', // Руки: Плечелучевая мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e9c',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Тяга верхнего блока',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сидя, тяните рукоятку вниз к верхней части груди.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e9d',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Разгибание ног',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Разгибайте ноги, поднимая утяжеленную подушку на тренажере.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e9e',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Сгибание ног',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сгибайте ноги, поднимая утяжеленную подушку на тренажере.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e628', // Ноги: Бицепс бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '675decca0e6eababfa8226e7',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Выпады с гантелями на одну ногу',
    type: 'repeats',
    each_side: true,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сделайте шаг вперед в положение выпада, держа гантели в руках. Приседайте на одну ногу.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52e9f',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Выпады с гантелями',
    type: 'repeats',
    each_side: true,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сделайте шаг вперед в положение выпада, держа гантели в руках.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ea0',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъемы на носки',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '675decca0e6eababfa8226e7' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Поднимайтесь на носки, стоя на полу.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e62e', // Ноги: Икроножная мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ea1',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим штанги на наклонной скамье',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте жим штанги лежа на наклонной скамье.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e616', // Грудь: Верхний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
      '675e00fc5d1f1d8d19f8e623', // Плечи: Передняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ea2',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Отжимания на брусьях',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Опускайте и поднимайте тело между параллельными брусьями.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e618', // Грудь: Нижний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
  },
  {
    id: '6709596b5c61afda0db52ea3',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Тяга к лицу',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Тяните трос к лицу, фокусируясь на задних дельтах.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e622', // Плечи
      '675e00fc5d1f1d8d19f8e625', // Плечи: Задняя дельта
      '675e00fc5d1f1d8d19f8e61c', // Спина: Верхняя Трапецевидная мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ea6',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Молотковые сгибания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте сгибания рук с гантелями, держа их ладонями друг к другу.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
      '675e00fc5d1f1d8d19f8e633', // Руки: Плечелучевая мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ea7',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Тяга сидя к животу',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сидя за тренажером, тяните рукоятку к животу.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ea9',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Разведение гантелей лежа',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежа на скамье, разведите руки с гантелями в стороны, затем сведите их над грудью.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eaa',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем гантелей в стороны',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Стоя с гантелями в руках, поднимите их в стороны до уровня плеч.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e622', // Плечи
      '675e00fc5d1f1d8d19f8e624', // Плечи: Средняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eab',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем на носки в тренажере жима ногами',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Используя тренажер для жима ногами, поднимайтесь на носки, разгибая голеностопы.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e62e', // Ноги: Икроножная мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eac',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем таза со штангой',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Упритесь верхней частью спины в скамью и поднимите штангу с пола, используя мышцы бедер.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
      '675e00fc5d1f1d8d19f8e628', // Ноги: Бицепс бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ead',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Отжимания на брусьях на грудные мышцы',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '67635cabccc2d8f80ec3b0a9' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Опускайте тело между параллельными брусьями, наклоняясь вперед для акцента на грудные мышцы.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e618', // Грудь: Нижний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
  },
  {
    id: '6709596b5c61afda0db52eae',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Сгибание ног сидя',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сидя в тренажере, сгибайте ноги, поднимая утяжеленную подушку.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e628', // Ноги: Бицепс бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eaf',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Тяга гантели в наклоне',
    type: 'repeats',
    each_side: true,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Наклонитесь, опираясь одной рукой на скамью, и тяните гантель другой рукой к боку.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb0',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Сведение рук на кроссовере',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Встаньте между двумя блоками кроссовера и сведите руки перед грудью.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb1',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем плечь со штангой',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Держите штангу перед бедрами и поднимайте плечи к ушам.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61c', // Спина: Верхняя Трапецевидная мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb2',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Французский жим лежа',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежа на скамье, опустите штангу или EZ-гриф ко лбу, затем выпрямите руки.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb3',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем на носки сидя',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сидя с согнутыми коленями, поднимайте пятки от пола, используя тренажер или веса на бедрах.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e62e', // Ноги: Икроножная мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb4',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Обратные разведения',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '67633fc0ccc2d8f80ec3b09d' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Наклонитесь вперед и поднимайте гантели в стороны, фокусируясь на задних дельтах.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e622', // Плечи
      '675e00fc5d1f1d8d19f8e625', // Плечи: Задняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb6',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем штанги на бицепс',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Стоя со штангой в руках, поднимайте ее к плечам.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
      '675e00fc5d1f1d8d19f8e633', // Руки: Плечелучевая мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb7',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим в тренажере на грудные мышцы',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сядьте в тренажер для жима на грудные мышцы и отталкивайте рукоятки от груди.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb8',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Румынская становая тяга',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Держите штангу перед бедрами, наклоняйтесь вперед, опуская ее вниз, сохраняя ноги почти прямыми.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e620', // Спина: Выпрямляющая позвоночник мышца
      '675e00fc5d1f1d8d19f8e628', // Ноги: Бицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eb9',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим гантелей сидя',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сидя на скамье с опорой для спины, выжимайте гантели или штангу над головой.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e622', // Плечи
      '675e00fc5d1f1d8d19f8e623', // Плечи: Передняя дельта
      '675e00fc5d1f1d8d19f8e624', // Плечи: Средняя дельта
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eba',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Сгибание рук на скамье Скотта',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Опирайтесь руками на скамью Скотта и поднимайте штангу или гантели к плечам.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ebb',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Гакк-приседания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте приседания в тренажере для гакк-приседаний с поддержкой спины.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ebc',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим на наклонной скамье вниз головой',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте жим штанги на скамье с отрицательным наклоном для проработки нижней части грудных мышц.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e618', // Грудь: Нижний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
      '675e00fc5d1f1d8d19f8e623', // Плечи: Передняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ebd',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Т-тяга',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Используйте Т-образную тягу или штангу в тренажере для тяги к поясу.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ebe',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим Арнольда',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте жим гантелей с поворотом кистей от себя к себе во время движения.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e622', // Плечи
      '675e00fc5d1f1d8d19f8e623', // Плечи: Передняя дельта
      '675e00fc5d1f1d8d19f8e624', // Плечи: Средняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ebf',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Разгибание рук за головой',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '67635cabccc2d8f80ec3b0a9' ],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec0',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Пуловер с гантелей',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежа на скамье, опустите гантель за голову, затем верните ее обратно над грудью.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec1',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим ногами сидя',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Используйте тренажер для жима ногами сидя, чтобы отталкивать вес ногами.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec2',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Фронтальные приседания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте приседания со штангой, расположенной на передней части плеч.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
      '675e00fc5d1f1d8d19f8e635', // Пресс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec3',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Тяга штанги к подбородку',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Поднимайте штангу или гантели вертикально перед собой до уровня груди.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e622', // Плечи
      '675e00fc5d1f1d8d19f8e61c', // Спина: Верхняя Трапецевидная мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec4',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Разгибание рук с гантелями из-за головы',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Держите гантель обеими руками за головой и разгибайте руки вверх.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec5',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим гантелей на наклонной скамье',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '67635cabccc2d8f80ec3b0a9' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежа на наклонной скамье, выжимайте гантели вверх от уровня груди.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e616', // Грудь: Верхний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
      '675e00fc5d1f1d8d19f8e623', // Плечи: Передняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec6',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Тяга к лицу сидя на нижнем блоке',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сидя, тяните трос к лицу, фокусируясь на задних дельтах и верхней части спины.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e622', // Плечи
      '675e00fc5d1f1d8d19f8e625', // Плечи: Задняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec7',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Приседания с гантелями',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Держа гантели по бокам, выполняйте приседания.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ec8',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим штанги узким хватом',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте жим штанги лежа, держа руки ближе друг к другу для акцента на трицепсы.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52eca',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Тяга в тренажере',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Используйте тренажер для тяги, чтобы подтягивать рукоятки к животу.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ecb',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Жим гантелей лежа',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежа на плоской скамье, выжимайте гантели вверх от уровня груди.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
      '675e00fc5d1f1d8d19f8e623', // Плечи: Передняя дельта
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ecc',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Мостик',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежа на спине с согнутыми коленями, поднимайте таз вверх, напрягая ягодицы.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
      '675e00fc5d1f1d8d19f8e620', // Спина: Выпрямляющая позвоночник мышца
    ],
  },
  {
    id: '6709596b5c61afda0db52ecd',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем плечь с гантелями',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '67633fc0ccc2d8f80ec3b09d' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Держа гантели по бокам, поднимайте плечи к ушам.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61c', // Спина: Верхняя Трапецевидная мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed0',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Приведение ног',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Используйте тренажер для приведения ног, чтобы свести ноги вместе против сопротивления.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e62d', // Ноги: Медиальная широкая мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed1',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Отведение ног',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Используйте тренажер для отведения ног, чтобы развести ноги в стороны против сопротивления.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e62c', // Ноги: Латеральная широкая мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed2',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Боковые выпады с гантелями',
    type: 'repeats',
    each_side: true,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Держа гантели, сделайте шаг в сторону, опуская тело в положение выпада.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
      '675e00fc5d1f1d8d19f8e62c', // Ноги: Латеральная широкая мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed3',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Косые скручивания на блоке',
    type: 'repeats',
    each_side: true,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Тяните трос сверху вниз по диагонали через тело, имитируя движение рубки дров.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e637', // Пресс: Внешние косые мышцы
      '675e00fc5d1f1d8d19f8e638', // Пресс: Внутренние косые мышцы
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed4',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Наклоны со штангой на плечах',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Со штангой на плечах, наклоняйтесь вперед в пояснице, опуская корпус параллельно полу.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e620', // Спина: Выпрямляющая позвоночник мышца
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed5',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Концентрированный подъем на бицепс',
    type: 'repeats',
    each_side: true,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сидя, поднимайте гантель на бицепс, упирая локоть во внутреннюю поверхность бедра.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed6',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Скручивания на блоке',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Стоя на коленях перед тренажером, выполняйте скручивания, тяня трос руками из-за головы.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed7',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Приседания в тренажере Смита',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте приседания, используя тренажер Смита для направленного движения штанги.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626', // Ноги
      '675e00fc5d1f1d8d19f8e627', // Ноги: Квадрицепс бедра
      '675e00fc5d1f1d8d19f8e62b', // Ноги: Ягодичная мышца бедра
    ],
    mass_unit: 'kg',
  },
  {
    id: '6709596b5c61afda0db52ed8',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Обратные скручивания на наклонной скамье',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте обратные скручивания на наклонной скамье для повышенной сложности.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
    ],
  },
  {
    id: '670c01f55e1aff8943a61fb1',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания лучника',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '670c01ff5e1aff8943a61fb2',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания вокруг света',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '670c02c05e1aff8943a61fb3',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания на одной руке',
    type: 'repeats',
    each_side: true,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '670c02db5e1aff8943a61fb4',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания средним хватом',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fb5',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания узким хватом',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fb6',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания широким хватом',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fb7',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания обратным средним хватом',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fb8',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подтягивания обратным узким хватом',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: '',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e61b', // Спина
      '675e00fc5d1f1d8d19f8e61f', // Спина: Широчайшая мышца
      '675e00fc5d1f1d8d19f8e632', // Руки: Бицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fba',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Бриллиантовые отжимания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте отжимания с сомкнутыми руками, образуя форму бриллианта с указательными пальцами и большими пальцами. Этот вариант направлен на трицепс и внутренние грудные мышцы.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fbb',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Отжимания с ногами на скамье',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте отжимания с поднятыми ногами на скамейку или платформу. Этот вариант направлен на верхнюю часть груди и передние плечи более интенсивно, чем стандартные отжимания.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e616', // Грудь: Верхний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fbc',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Отжимания от скамьи',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте отжимания с рук на высокой поверхности, такой как скамейка или ступенька. Этот вариант проще, чем стандартные отжимания, и направлен на нижнюю часть груди.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e618', // Грудь: Нижний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fbd',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Плиометрические отжимания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте пульсометрические отжимания, где вы подталкиваете свое тело вверх с достаточной силой, чтобы ваши руки оторвались от пола. Это упражнение развивает силу в груди, плечах и трицепсах. Приземляйтесь мягко с немного согнутыми локтями, чтобы поглотить удар.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fbe',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Шахматные отжимания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте отжимания с одной рукой немного вперед и другой немного назад. Этот вариант вызывает дисбаланс и активизирует пресс больше. Меняйте положение рук в каждом подходе, чтобы обеспечить равномерное развитие.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
      '675e00fc5d1f1d8d19f8e635', // Пресс
    ],
  },
  {
    id: '670c03175e1aff8943a61fbf',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Отжимания на одной руке',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте отжимания с одной рукой, с другой рукой за спиной. Этот вариант значительно увеличивает сложность, требуя больше силы и стабильности. Он направлен на грудь, трицепс и плечи, а также активизирует пресс для баланса. Начните с более широкого положения ног для большей стабильности, и продвигайтесь к более узкому положению по мере того, как вы станете сильнее.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
      '675e00fc5d1f1d8d19f8e635', // Пресс
    ],
  },
  {
    id: '670c03175e1aff8943a61fc0',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Широкие отжимания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте отжимания с рук, расположенных шире, чем ширина плеч. Этот вариант усиливает работу наружных грудных мышц и передних дельтовидов. Поддерживайте прямую линию корпуса в течение всего движения. Опускайте грудь к полу, затем возвращайтесь в исходное положение.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fc1',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Стандартные отжимания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '67635cabccc2d8f80ec3b0a9' ],
    archived: false,
    image: null,
    is_default: true,
    description: 'Выполняйте стандартные отжимания с рук, расположенных на ширине плеч. Начните в планке с вытянутыми руками, затем опустите свое тело, пока грудь почти не коснется пола. Возвращайтесь в исходное положение, держа корпус прямой в течение всего движения. Это упражнение в основном направлено на грудь, трицепс и плечи, а также активизирует пресс для стабильности.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e615', // Грудь
      '675e00fc5d1f1d8d19f8e617', // Грудь: Средний пучок
      '675e00fc5d1f1d8d19f8e631', // Руки: Трицепс
    ],
  },
  {
    id: '670c03175e1aff8943a61fc3',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Планка',
    type: 'duration',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Удерживайте планку в течение 30-60 секунд.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
      '675e00fc5d1f1d8d19f8e639', // Пресс: Поперечные мышцы
    ],
  },
  {
    id: '670c03175e1aff8943a61fc4',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъемы ног',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежите на спине, поднимите ноги прямо вверх, затем опустите их обратно без касания пола.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
    ],
  },
  {
    id: '670c03175e1aff8943a61fc5',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Русский твист',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Сядьте прямо, с согнутыми коленями и поднятыми ногами, поверните корпус из стороны в сторону.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
      '675e00fc5d1f1d8d19f8e639', // Пресс: Поперечные мышцы
    ],
  },
  {
    id: '670c03175e1aff8943a61fc6',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Птица-Собака',
    type: 'duration',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Начните на четвереньках, поднимите правую руку и левую ногу, держите, затем меняйте стороны.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e620', // Спина: Выпрямляющая позвоночник мышца
      '675e00fc5d1f1d8d19f8e635', // Пресс
    ],
  },
  {
    id: '670c03175e1aff8943a61fc7',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Подъем ног в висе',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Висите на турнике, поднимите ноги прямо вверх, затем опустите их обратно.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
    ],
  },
  {
    id: '670c03175e1aff8943a61fc8',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Планка на боку',
    type: 'duration',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежите на боку с согнутыми ногами, поднимите корпус',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
      '675e00fc5d1f1d8d19f8e639', // Пресс: Поперечные мышцы
    ],
  },
  {
    id: '670c0aea5e1aff8943a61fc9',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Флаг Дракона',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Руки, расположенные за головой, при этом выполняют лишь поддерживающую функцию. Подъем туловища выше уровня плеч, удержание его в этой позиции и опускание, происходят за счет усилий мышц самого пресса.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
      '675e00fc5d1f1d8d19f8e637', // Пресс: Внешние косые мышцы
    ],
  },
  {
    id: '670c0aea5e1aff8943a61fca',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Скручивания на верхнем блоке',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Присядьте лицом к кабельной машине, тяните кабель к груди, и удерживайте некоторое время.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
    ],
  },
  {
    id: '670c0aea5e1aff8943a61fcc',
    updated_at: 1648771200000,
    created_at: 1648771200000,
    title: 'Обратные скручивания',
    type: 'repeats',
    each_side: false,
    hours: false,
    is_in_workout: false,
    in_workouts: [],
    archived: false,
    image: null,
    is_default: true,
    description: 'Лежите на спине, согните колени, и поднимите их к груди. Поднимите ягодицы от пола, сожмите в верхней точке, и постепенно опуститесь вниз.',
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e635', // Пресс
      '675e00fc5d1f1d8d19f8e636', // Пресс: Прямая мышца
    ],
  },
  {
    updated_at: 1734620944786,
    created_at: 1648771200000,
    id: '676436e3bcb109d88b6b02c8',
    title: 'Выпады с гантелями на одну ногу со скамьей',
    type: 'repeats',
    each_side: true,
    hours: false,
    is_in_workout: true,
    in_workouts: [ '675decca0e6eababfa8226e7' ],
    archived: false,
    muscle_groups: [
      '675e00fc5d1f1d8d19f8e626',
      '675e00fc5d1f1d8d19f8e627',
      '675e00fc5d1f1d8d19f8e62b',
    ],
    description: 'Сделайте шаг вперед в положение выпада, держа гантели в руках. Заднюю ногу поместите на скамью. Приседайте на одну ногу.',
    mass_unit: 'kg',
  },
]

export default exercises
