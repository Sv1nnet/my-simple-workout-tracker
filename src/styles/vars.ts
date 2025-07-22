export const theme = {
  backgroundColor: '#fff',
  navIconColor: '#7e7e7e',
  navBorderColor: '#c5c5c5',
  primaryColor: '#0aa679', // primary color for all components
  ghostPrimaryColor: '#e7f5f0', // primary color for all components
  linkColor: '#1890ff', // link color
  successColor: '#52c41a', // success state color
  warningColor: '#faad14', // warning state color
  errorColor: '#f5222d', // error state color
  resultPositiveColor: '#01c515',
  fontSizeBase: '14px', // major text font size
  headingColor: 'rgba(0, 0, 0, 0.85)', // heading text color
  textColor: 'rgba(0, 0, 0, 0.65)', // major text color
  textColorSecondary: 'rgba(0, 0, 0, 0.45)', // secondary text color
  disabledColor: 'rgba(0, 0, 0, 0.5)', // disable state color
  disabledBackgroundColor: '#f5f5f5',
  addonBackgroundColor: '#fafafa', // disable state color
  borderRadiusBase: '2px', // major border radius
  borderColorBase: '#d9d9d9', // major border color
  selectedListItemColor: '#e7f5f0',
  tagBackgroundColor: '#fafafa',
  avatarBackground: '#ccc',
  boxShadowBase: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)', // major shadow for layers
  roundColor: '#a5a3a3',
  roundDivider: 'lightgrey',

  actionColors: {
    edit: {
      active: '#ffce6c',
      inactive: '#faad14',
    },
    start: {
      active: '#3acba1',
      inactive: '#0aa679',
    },
  },
}

export const darkTheme = {
  ...theme,
  headingColor: 'rgba(255, 255, 255, 0.85)',
  navBorderColor: '#4c4c4c',
  tagBackgroundColor: '#353535',
  selectedListItemColor: '#22352e',
  avatarBackground: '#7a7a7a',
  textColor: '#d1d1d1d1',
  textColorSecondary: '#808080',
  backgroundColor: '#191919',
  primaryColor: '#07684d',
  ghostPrimaryColor: '#075c447d',
  disabledColor: 'rgba(255, 255, 255, 0.5)',
  disabledBackgroundColor: '#1c1c1c',
  addonBackgroundColor: '#161616',
  borderColorBase: '#414141',
  roundColor: '#7e7e7e',
  roundDivider: '#505050',
}
