const firstDuplicate = (str) => {
  let copy = "";
  for (let char of str) {
    if (copy.includes(char)) {
      console.log(char);
      return char;
    } else if (copy.length + 1 === str.length) {
      console.log(null);
      return null;
    } else {
      copy += char;
    }
  }
};

firstDuplicate("abca");
//a
firstDuplicate("abcefhc");
//c
firstDuplicate("abcefh");
// null
