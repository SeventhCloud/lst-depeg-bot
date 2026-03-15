const escapeMarkdownV2 = (text: string): string => {
  return text.replace(/[_*~`>#+\-=|{}.!]/g, '\\$&');
}

export default escapeMarkdownV2