import { name, random, lorem } from "faker";
import { writeFile } from "fs";

const languages = [
  "Python",
  "JavaScript",
  "C++",
  "C",
  "Java",
  "C#",
  "Swift",
  "Kotlin",
  "Go",
  "Dart",
  "Rust"
];

const generate = (count: number) => {
  const devs = [...Array(count).keys()].map(_index => {
    return {
      name: name.firstName(),
      language: random.arrayElement(languages),
      experienceLevel: random.number(10),
      animal: lorem.word()
    };
  });

  writeFile("developers.json", JSON.stringify(devs), err => {
    if (err) console.error(err);
  });
};

generate(10000);
