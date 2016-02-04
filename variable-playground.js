var person = {
  name: 'Andrew',
  age: 21
};
function updatePerson (obj) {
  obj.age = 24;
}
updatePerson(person);
//console.log(person);

// Array example
var arr = [15, 37];

function addGrade(arr, value) {
  arr.push(value);
  debugger;
}
addGrade(arr, 44);
console.log(arr);
