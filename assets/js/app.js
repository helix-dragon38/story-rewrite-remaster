const story = [
  { scene:'rooftop', chapter:'PROLOGUE', speaker:'Mara', text:'For seven years, I have written the ending to a story that never happened.', character:'left' },
  { scene:'rooftop', chapter:'PROLOGUE', speaker:'Mara', text:'Every night, the same rooftop. Every night, the same empty sky. And tonight, someone has left a key beside me.', character:'left' },
  { scene:'rooftop', chapter:'PROLOGUE', speaker:'??', text:'You kept it safe, Mara. The last page of the story.', character:'right' },
  { scene:'rooftop', chapter:'CHAPTER I · THE KEY', speaker:'Mara', text:'The voice belonged to Eli—my oldest friend, except that Eli disappeared when we were sixteen.', character:'hidden' },
  { scene:'rooftop', chapter:'CHAPTER I · THE KEY', speaker:'Eli', text:'We have one hour before sunrise. After that, the world will remember the ending I wrote instead of the life we lived.', character:'right', choices:[
    { text:'Ask why Eli returned.', next:5, trust:1 },
    { text:'Demand to know who wrote the ending.', next:6, courage:1 }
  ] },
  { scene:'station', chapter:'CHAPTER I · THE KEY', speaker:'Mara', text:'“Because you were the only person I trusted to change it,” Eli says.', character:'right' },
  { scene:'archive', chapter:'CHAPTER I · THE KEY', speaker:'Mara', text:'“Someone in the Archive,” Eli answers. “They edit memories and call it peace.”', character:'right' },
  { scene:'station', chapter:'CHAPTER II · THE OLD STATION', speaker:'Eli', text:'The tram will take us beneath the city. The question is whether you are willing to ride.', character:'right', choices:[
    { text:'Board the tram with Eli.', next:8, trust:1 },
    { text:'Search the platform for another way.', next:9, courage:1 }
  ] },
  { scene:'station', chapter:'CHAPTER II · THE OLD STATION', speaker:'Narrator', text:'Mara and Eli board the silent tram. Statues of forgotten people watch through the glass.', character:'right' },
  { scene:'station', chapter:'CHAPTER II · THE OLD STATION', speaker:'Mara', text:'A service tunnel leads toward the Archive. Its rusted sign reads: “DO NOT FORGET.”', character:'left' },
  { scene:'archive', chapter:'CHAPTER III · THE ARCHIVE', speaker:'Archivist', text:'You came for the original manuscript. A dangerous thing—a story that remembers what the world has forgotten.', character:'hidden' },
  { scene:'archive', chapter:'CHAPTER III · THE ARCHIVE', speaker:'Eli', text:'The final page is missing. Mara, did you ever find it—or did you write it?', character:'right' },
  { scene:'archive', chapter:'CHAPTER III · THE ARCHIVE', speaker:'Mara', text:'Beneath the Archive, I discover the truth: I am not preserving the story. I am living inside it.', character:'left', choices:[
    { text:'Restore the world and lose my memories.', next:13, trust:1, courage:-1 },
    { text:'Keep the rewritten ending and save Eli.', next:14, trust:-1, courage:1 }
  ] },
  { scene:'dawn', chapter:'ENDING · DAWN', speaker:'Narrator', text:'Mara turns the first page back into reality. Eli fades, not because he was false—but because his story has finally begun elsewhere.', character:'hidden', ending:'The Dawn Remembers', endingText:'The world awakens with scars instead of perfect seams. People begin to remember each other, and Mara carries Eli’s laughter into the morning.' },
  { scene:'memory', chapter:'ENDING · THE SECOND AUTHOR', speaker:'Mara', text:'I close the manuscript. The rewritten world remains—but one line changes everything.', character:'left', ending:'The Second Author', endingText:'Mara becomes the keeper of the untold. Eli lives, and the city learns that a peaceful ending can be imperfect—and still belong to everyone.' }
];

const $ = id => document.getElementById(id);
const scene = $('scene-art');
const speaker = $('speaker');
const dialogue = $('dialogue');
const choices = $('choices');
const continueButton = $('continue-button');
const character = $('character');
let index = 0;
let stats = { trust: 0, courage: 0 };
let typing = false;
let fullText = '';

function setCharacter(position) {
  character.className = 'character';
  if (position === 'hidden') character.classList.add('hidden');
  if (position === 'left') character.classList.add('slide-left');
  if (position === 'right') character.classList.add('slide-right');
}

function typeText(text) {
  typing = true;
  fullText = text;
  dialogue.textContent = '';
  let i = 0;
  const speed = window.matchMedia('(pointer: coarse)').matches ? 12 : 18;
  const timer = setInterval(() => {
    dialogue.textContent += text.charAt(i);
    i++;
    if (i >= text.length) { clearInterval(timer); typing = false; }
  }, speed);
}

function showNode(nextIndex = index) {
  index = nextIndex;
  const node = story[index];
  if (!node) return;

  scene.dataset.scene = node.scene;
  $('chapter').textContent = node.chapter;
  speaker.textContent = node.speaker;
  choices.innerHTML = '';
  setCharacter(node.character || 'hidden');

  if (node.choices) {
    continueButton.classList.add('hidden');
    node.choices.forEach(choice => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.textContent = choice.text;
      button.onclick = () => {
        stats.trust += choice.trust || 0;
        stats.courage += choice.courage || 0;
        showNode(choice.next);
      };
      choices.appendChild(button);
    });
  } else {
    continueButton.classList.remove('hidden');
  }

  typeText(node.text);

  if (node.ending) {
    continueButton.onclick = () => showEnding(node);
  } else {
    continueButton.onclick = () => {
      if (typing) {
        dialogue.textContent = fullText;
        typing = false;
      } else {
        showNode(index + 1);
      }
    };
  }
}

function showEnding(node) {
  $('ending-title').textContent = node.ending;
  $('ending-text').textContent = node.endingText;
  $('ending').classList.remove('hidden');
}

$('menu-button').onclick = () => $('menu').classList.remove('hidden');
$('continue-game').onclick = () => $('menu').classList.add('hidden');
$('restart-game').onclick = () => { stats = { trust:0, courage:0 }; $('menu').classList.add('hidden'); showNode(0); };
$('save-game').onclick = () => { localStorage.setItem('storyRewriteSave', JSON.stringify({ index, stats })); $('menu-status').textContent = 'Progress saved.'; };
$('load-game').onclick = () => {
  const save = JSON.parse(localStorage.getItem('storyRewriteSave') || 'null');
  if (!save) { $('menu-status').textContent = 'No saved progress found.'; return; }
  index = save.index; stats = save.stats || { trust:0, courage:0 }; $('menu-status').textContent = 'Progress loaded.';
  $('menu').classList.add('hidden'); showNode(index);
};
$('play-again').onclick = () => { $('ending').classList.add('hidden'); stats = { trust:0, courage:0 }; showNode(0); };

showNode(0);
