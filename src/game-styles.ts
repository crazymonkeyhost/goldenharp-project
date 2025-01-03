import { TextStyleOptions } from 'pixi.js';

const COLORS = {
  YELLOW: '#FFBB00',
  ORANGE: '#FF8400',
  RED: '#D42127',
  BLUE: '#B5C8FF',
  GREEN: '#84EA1F',
  PINK: '#F42CCE',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
};


const settingsBaseStyle: Partial<TextStyleOptions> = {
  fill: COLORS.YELLOW,
  fontSize: 40,
  fontFamily: 'Greconian, Arial',
  fontWeight: 'normal',
};

export const gameStyles = {

  paytableValue: {
    fill: COLORS.WHITE,
    fontSize: 18,
    fontFamily: 'Greconian,Arial',
    fontWeight: 'normal',
    align: 'left',
    stroke: {
      color: '#331001',
      width: 3,
    },
  },

  paytableMult: {
    ...settingsBaseStyle,
    fontSize: 18,
    stroke: {
      color: '#331001',
      width: 3,
    },
    dropShadow: false,
  },

  mainSceneFieldLabel: {
    fill: COLORS.GREEN,
    fontSize: 10,
    fontFamily: 'GalindoRegular, Arial',
    fontWeight: 'normal',
  },

  mainSceneFieldValue: {
    fill: COLORS.WHITE,
    fontSize: 20,
    fontFamily: 'GalindoRegular,Arial',
    fontWeight: 'normal',
  },

  mainSceneButtonValue: {
    fill: '#FFE2B9',
    fontSize: 10,
    fontFamily: 'GalindoRegular, Arial',
    fontWeight: 'normal',
    align:'center',
    stroke: {
      color: '#240C15',
      width: 2,
    },
  },


  betSettingValue: {
    fill: "#8B2A11",
    fontSize: 36,
    fontFamily: 'GalindoRegular, Arial',
    fontWeight: 'normal',
  },

  settingsTitle: {
    fill: COLORS.ORANGE,
    fontSize: 65,
    fontFamily: 'DIOGENES, Arial',
    fontWeight: 'normal',
  },

  settingsTitle2: {
    fill: COLORS.YELLOW,
    fontSize: 65,
    fontFamily: 'DIOGENES, Arial',
    fontWeight: 'normal',
    dropShadow: {
      distance: 7,
      blur: 2,
      color: '#242222',
      alpha: 0.3,
      angle: 15,
    },
  },

  settingSlider: {
    ...settingsBaseStyle,
    fontSize: 40,
  },

  settingSliderValue: {
    ...settingsBaseStyle,
    fontFamily: 'GalindoRegular, Arial',
    fill: COLORS.RED,
    fontSize: 40,
  },

  settingCheckboxTitle: {
    ...settingsBaseStyle,
    fontSize: 30,
  },

  bookmarksLabel: {
    ...settingsBaseStyle,
    fontSize: 28,
  },

  apSelectorValue: {
    fill: "#EF181F",
    fontSize: 52,
    fontFamily: 'GalindoRegular, Arial',
    fontWeight: 'normal',
  },

  apStartButton: {
    fill: "#61111D",
    fontSize: 58,
    fontFamily: 'Greconian, Arial',
    fontWeight: 'normal',
    align: 'center',
    dropShadow: {
      distance: 5,
      blur: 2,
      color: '#c7c5bf',
      alpha: 0.3,
      angle: 0,
    },
  },

  keysTotalField: {
    fill: '#ce5c2f',
    fontSize: 46,
    fontFamily: 'Greconian,Arial',
    fontWeight: 'normal',

    align: 'left',
    stroke: {
      color: '#331001',
      width: 14,
    },
    dropShadow: {
      distance: 2,
      blur: 7,
      color: '#331001',
      alpha: 0.3,
      angle: 0,
    },
  },

  keysAmountField: {
    fill: COLORS.YELLOW,
    fontSize: 46,
    fontFamily: 'Greconian,Arial',
    fontWeight: 'normal',
    align: 'right',
    stroke: {
      color: '#331001',
      width: 14,
    },
    dropShadow: {
      distance: 2,
      blur: 7,
      color: '#331001',
      alpha: 0.3,
      angle: 0,
    },
  },

  clocks: {
    fill: COLORS.WHITE,
    stroke: {
      color: COLORS.BLACK,
      width: 2,
    },
    fontSize: 13,
    fontFamily: 'GalindoRegular',
  },

  popupText: {
    fill: "#FB6703",
    fontSize: 48,
    fontFamily: 'DIOGENES, Arial',
    fontWeight: 'normal',
    align: 'center',
    stroke: {
      color: COLORS.BLACK,
      width: 7,
    },
    dropShadow: {
      distance: 2,
      blur: 2,
      color: COLORS.BLACK,
      alpha: 0.3,
      angle: 0,
    },
  },

  popupMainButton: {
    fill: "#61111D",
    fontSize: 58,
    fontFamily: 'Greconian, Arial',
    fontWeight: 'normal',
    align: 'center',
    dropShadow: {
      distance: 5,
      blur: 2,
      color: '#c7c5bf',
      alpha: 0.3,
      angle: 0,
    },
  },

  buyBonusButton: {
    fill: "#d0f0e3",
    fontSize: 25,
    fontFamily: 'Greconian,Arial',
    fontWeight: 'normal',
    align: 'center',
    stroke: {
      color: '#16A829',
      width: 3,
    },
    dropShadow: {
      distance: 2,
      blur: 2,
      color: '#331001',
      alpha: 0.3,
      angle: 0,
    },
  },

  buyBonsPrice: {
    fill: "#FF9900",
    fontSize: 25,
    fontFamily: 'GalindoRegular, Arial',
    fontWeight: 'normal',
    align: 'center',
    stroke: {
      color: '#000000',
      width: 2,
    },
  },

  buyBonusTabButton: {
    fill: "#61111D",
    fontSize: 40,
    fontFamily: 'DIOGENES, Arial',
    fontWeight: 'normal',
    align: 'center',
    dropShadow: {
      distance: 5,
      blur: 2,
      color: '#c7c5bf',
      alpha: 0.3,
      angle: 0,
    },
  },
} as const;
