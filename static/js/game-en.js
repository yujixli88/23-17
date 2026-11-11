let currentIndex = 0;
let glitters = 0;
let currentRank = "Basic level";

window.onload = function() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        document.getElementById('profile-status').innerText = user.email;
        document.getElementById('rank-display').innerText = user.rank_level === "Базовый уровень"
            ? "Basic level"
            : user.rank_level;
        document.getElementById('glitters-display').innerText = user.glitters;
        glitters = user.glitters;
    }
}

const story = [
    { speaker: "voice", text: "️ The Last Chime at 11:17 PM" },
    { speaker: "At 10:40 PM", text: "Arden announces:\n— Tomorrow morning, I’m going to make a few changes. And some of you are not going to like them one bit.\nEveryone takes his words as yet another act of manipulation." },
    { speaker: "At 11:05 PM", text: "️ Arden retires to his study. " },
    { speaker: "At 11:17 PM", text: "️The chime of an antique grandfather clock echoes throughout the hotel. " },
    { speaker: "At 11:17 PM", text: "Eleven strikes."},
    { speaker: "At 11:17 PM", text: "️And then — one more.The chime of an antique grandfather clock echoes throughout the hotel." },
    { speaker: "At 11:17 PM", text: "️Eleven strikes. " },
    { speaker: "At 11:17 PM", text: "️The twelfth. " },
    { speaker: "At 11:17 PM", text: "️Only the housemaid notices something strange: that clock has been broken for ten years. " },
    { speaker: "At 11:17 PM", text: "️A few minutes later, the study door is found locked from the inside." },
    { speaker: "At 11:17 PM", text: "️Arden is sitting at his desk." },
    { speaker: "At 11:17 PM", text: "️Dead. " },
    { speaker: "At 11:17 PM", text: "️On the desk:\nA glass of red wine;\nAn open safe;\nAn old family photograph;\nA sheet of paper bearing a handwritten name: “Eliza”;\nThe victim’s pocket watch, stopped at 11:17 PM." },
    { speaker: "At 11:17", text: "️The window is open.\nFootprints are visible in the snow beneath it.\nBut they lead away from the window toward the forest.\nThere are no footprints leading toward the window." },
    { speaker: "👥 Suspects", text: "️1. Eliza Arden — the victim’s daughter, 29.\nShe claims she spent the entire evening in the library.\nHer motive is obvious: her father was planning to disinherit her.\nBut she says:\n— I hated him. But I didn’t kill him.\nAnd indeed, there is no blood on her clothes, and witnesses saw her in the library for almost the entire evening." },
    { speaker: "👥 Suspects", text: "️3. Sophia Lange — the ex-wife, 51.\nAnd indeed, there is no blood on her clothes, and witnesses saw her in the library for almost the entire evening.\nTwenty years ago, Arden destroyed her reputation, costing her career.\nShe has returned to the hotel for the first time in many years.\nWhen asked why she came, she replies:\n— I wanted to make sure he finally got what he deserved." },
    { speaker: "👥 Suspects", text: "️4. Thomas Reed — the hotel manager, 36.\nHe has worked here since childhood.\nHe knows every secret passage, every old lock, and exactly how the clocks work.\nAnd he was the first to discover the body.\nFar too convenient." },
    { speaker: "👥 Suspects", text: "️5. May Hall — the housemaid, 24.\nShe was the last person to see Arden alive.\nShe brought him wine in his study at around 10:55 PM.\nWhen asked why Arden had written the name Eliza, she replies:\n— I don’t know. I can’t even read French.\nThe detective looks at her.\nBecause the name “Eliza” is written in perfectly ordinary letters." },
    { speaker: "🔎 And now things get really interesting", text: "️The autopsy reveals that Arden was not poisoned by the wine.\nThe cause of death was a severe blow to the head.\nThere is no murder weapon in the study.\nHowever, a tiny spot of blood is found on the fireplace.\nBarely the size of a fingernail." },
    { speaker: "voice", text: "️ The autopsy reveals that Arden was not poisoned by the wine.\nThe cause of death was a severe blow to the head.\nThere is no murder weapon in the study.\nHowever, a tiny spot of blood is found on the fireplace." },
    { speaker: "Voice", text: "️Barely the size of a fingernail.\nAnd there is one more anomaly:\nThe victim’s watch did not stop at the moment of the murder. \nIt was deliberately stopped later." },
    { speaker: "Voice", text: "️The footprints in the snow also turn out to be fake.\nAnd that is when the detective realizes the crucial point:\nThe killer never left through the window at all.\nHe wanted everyone to believe the murderer had escaped outside." },
    { speaker: "Voice", text: "️" },
    { speaker: "", text: "️But why? " },
    { speaker: "Voice", text: "️Because the real problem was not how the killer had entered the study. \nIt was why he could leave it without appearing on a single security camera.\nAnd then the detective returns to the strange chime of the clock." },
    { speaker: "Voice", text: "️11:17 PM." },
    { speaker: "Voice", text: "️Eleven strikes." },
    { speaker: "Voice", text: "️A pause." },
    { speaker: "Voice", text: "️The twelfth." },
    { speaker: "Voice", text: "️Why?" },
    { speaker: "Voice", text: "️Because the clock did not strike twelve times on its own.\nIt struck eleven times, and then someone manually forced the mechanism to produce one more chime." },
    { speaker: "Voice", text: "️Which means the killer wanted to create a false time of death.\nArden had died much earlier." },
    { speaker: "Voice", text: "️And whoever did it must have been near him before 11:00 PM." },
    { speaker: "Voice", text: "️And then the detective notices one incredibly tiny detail.\nIn an old family photograph of the Ardens stands a little girl." },
    { speaker: "Voice", text: "️The caption reads:\n“Eliza, age 8.”.\nThe girl is holding a toy pocket watch.\nOn the back of the photograph, in Victor’s handwriting, are the words: \n“Real name — Eliza Lange.”" },
    { speaker: "Voice", text: "️In other words, Arden’s daughter is not Eliza Arden at all.\nShe is the daughter of Sophia Lange.\nAnd twenty-nine years ago, Arden kidnapped her from her mother and forged the documents."},
    { speaker: "Voice", text: "️That is why Sophia came.\nThat is why Arden wrote “Eliza.”\nAnd that is why the murder turns out to be something entirely different from what it first appears." },
    { speaker: "Voice", text: "️" },
    { speaker: "Voice", text: "️By morning, the storm had eased somewhat." },
    { speaker: "Voice", text: "️The detective stood in Victor Arden’s study, staring at the stopped clock." },
    { speaker: "Sophia", text: "️So you finally figured it out,” said quietly." },
    { speaker: "Voice", text: "️She was standing in the doorway." },
    { speaker: "Detective", text: "️I did, he replied.But not what you think." },
    { speaker: "Voice", text: "️Sophia turned pale." },
    { speaker: "Detective", text: "️ Did you kill Arden?" },
    { speaker: "Voice", text: "️She remained silent for several seconds. " },
    { speaker: "Sophia", text: "️Yes." },
    { speaker: "Voice", text: "️She clenched her fingers. " },
    { speaker: "Sophia", text: "️Then I saw the documents on his desk. Old documents. The originals. They contained everything. My daughter. Her real name. Her date of birth. Even a photograph.” " },
    { speaker: "Detective", text: "️“And you struck him?" },
    { speaker: "Voice", text: "️Sophia nodded" },
    { speaker: "Sophia", text: "️Once. " },
    { speaker: "Voice", text: "️There really had been blood on the fireplace." },
    { speaker: "Sophia", text: "️I didn’t mean to kill him, she continued." },
    { speaker: "Sophia", text: "️He fell. I panicked. I checked his pulse… He was still alive." },
    { speaker: "Voice", text: "️The detective frowned." },
    { speaker: "Detective", text: "️But you left." },
    { speaker: "Sophia", text: "️Yes." },
    { speaker: "Detective", text: "️Why?" },
    { speaker: "Sophia", text: "️Because I heard footsteps in the corridor." },
    { speaker: "Voice", text: "️She glanced at the door." },
    { speaker: "Sophia", text: "️I hid behind the curtain. And when someone entered… I saw May. " },
    { speaker: "Voice", text: "️The housemaid.\nThe detective slowly straightened." },
    { speaker: "Detective", text: "️Go on." },
    { speaker: "Sophia", text: "️She entered the study. She saw Arden lying on the floor. And instead of calling for help, she closed the door." },
    { speaker: "Voice", text: "️Sophia gave a humorless smile." },
    { speaker: "Detective", text: "️What did she do?" },
    { speaker: "Sophia", text: "️I don’t know. I left through the service passage." },
    { speaker: "Voice", text: "️A pause followed. " },
    { speaker: "Sophia", text: "️And then Arden died." },
    { speaker: "Voice", text: "️The detective found May in the laundry room." },
    { speaker: "Detective", text: "️You were in the study after Sophia." },
    { speaker: "Voice", text: "️The young woman froze." },
    { speaker: "May", text: "️I… wanted to check on him." },
    { speaker: "Detective", text: "️No." },
    { speaker: "Voice", text: "️He placed the pocket watch in front of her." },
    { speaker: "Detective", text: "️You knew he was still alive." },
    { speaker: "Voice", text: "️May remained silent. " },
    { speaker: "Detective", text: "️And you killed him. " },
    { speaker: "Voice", text: "️The girl covered her face with her hands." },
    { speaker: "May", text: "️He found out. " },
    { speaker: "Detective", text: "️Found out what?" },
    { speaker: "May", text: "️About my brother." },
    { speaker: "Voice", text: "️May finally looked up.\nHer brother had worked at the hotel five years earlier.\nVictor Arden had accused him of stealing money. \nThe young man had been sent to prison.\nBut he hadn't stolen anything." },
    { speaker: "May", text: "️Arden framed him,” May said. “My brother died in prison two years ago. " },
    { speaker: "Voice", text: "️She wiped away her tears. " },
    { speaker: "May", text:"I took this job specifically to prove that Arden was guilty. But he discovered who I was. Yesterday evening, he told me that the next morning he would hand over all the evidence against my brother to the police."  },
    { speaker: "Detective", text:"What evidence?" },
    { speaker: "May", text:"None." },
    { speaker: "Voice", text:"May gave a bitter smile."},
    { speaker: "May", text:"He was planning to destroy the last remaining documents and claim that my brother really had been a thief."  },
    { speaker: "Voice", text:"The detective looked at her." },
    { speaker: "Detective", text:"So you decided to kill him."  },
    { speaker: "May", text:"When I entered, he was alive. Sophia had already left. He tried to get up."  },
    { speaker: "Voice", text:"May fell silent."  },
    { speaker: "May", text:"I picked up the fireplace poker."  },
    { speaker: "Voice", text:"She said it almost in a whisper."  },
    { speaker: "May", text:"And struck him a second time."  },
    { speaker: "Voice", text:"Now the cause of death became clear. \nSophia’s first blow had been severe, but not fatal.\nThe second had killed him."  },
    { speaker: "Detective", text:"But what about the clock?” the detective asked."  },
    { speaker: "Voice", text:"May looked at it."  },
    { speaker: "May", text:"I wanted to confuse the investigation. Arden always said that time was the greatest lie. I decided to use his favorite toy against him."  },
    { speaker: "Voice", text:"She stopped the clock at 11:17 PM.\nThen she opened the window.\nShe left through an old service corridor.\nAnd Thomas had made the footprints in the snow.\nThe detective raised his head sharply."  },
    { speaker: "Detective", text:"Thomas?"  },
    { speaker: "Voice", text:"May nodded."  },
    { speaker: "Detective", text:"He helped you?"  },
    { speaker: "May", text:"Yes."  },
    { speaker: "Detective", text:"Why?"  },
    { speaker: "May", text:"Because he knew what Arden was planning to do."  },
    { speaker: "Voice", text:"Thomas was the person who had helped Sophia obtain the old documents many years earlier.\nHe knew the truth about Eliza."  },
    { speaker: "Voice", text:"And he knew that Arden had stolen the child.\nHe helped May stage the fake escape.\nBut he had not killed anyone himself.\nOne final question remained.\nEliza."  },
    { speaker: "Voice", text:"The detective found her in the library.\nShe was sitting by the window, holding the old photograph against her chest."  },
    { speaker: "Detective", text:"Did you know?"  },
    { speaker: "Eliza", text:"That I’m Sophia’s daughter?"  },
    { speaker: "Voice", text:"Eliza smiled"  },
    { speaker: "Detective", text:"Since this evening."  },
    { speaker: "Eliza", text:"How?"  },
    { speaker: "Voice", text:"She looked at the photograph."  },
    { speaker: "Eliza", text:"My father told me himself."  },
    { speaker: "Detective", text:"Why?"  },
    { speaker: "Eliza", text:"Because he was planning to tell everyone tomorrow morning."  },
    { speaker: "Voice", text:"The detective said nothing."  },
    { speaker: "Eliza", text:"He wanted to disinherit me. But before doing that, he decided to inflict one more cruelty. He wanted to tell my mother that I should be the one to decide whom I considered my family."  },
    { speaker: "Detective", text:"And whom did you choose?"  },
    { speaker: "Voice", text:"Eliza stared at the photograph for a long time."  },
    { speaker: "Eliza", text:"I don’t know."  },
    { speaker: "Voice", text:"She looked up."  },
    { speaker: "Eliza", text:"But I do know one thing. Victor Arden was not my father. Even if he had called me his daughter for twenty-nine years."  },
    { speaker: "Voice", text:"When the police arrived, Sophia confessed to the assault.\nMay confessed to the murder.\nThomas confessed to concealing evidence.\nBut the case turned out to be more complicated than an ordinary murder.\nBecause, technically, Sophia was not the killer."  },
    { speaker: "Voice", text:"Her blow had been the first link in the chain of events. \nMay had delivered the fatal blow.\nThomas had helped cover up the crime.\nAnd Eliza...."  },
    { speaker: "Voice", text:"Eliza had done absolutely nothing.\nShe had simply spent the entire night sitting in the library, waiting for someone to finally stop lying to her. \nBefore leaving, the detective returned to the study one last time.\nHe took the old photograph off the wall."  },
    { speaker: "Voice", text:"In it, little Eliza was holding a toy watch.\nThe detective turned the photograph over.\nVictor’s inscription was still visible on the back:\n“Real name — Eliza Lange.”"  },
    { speaker: "Voice", text:"He paused to think."  },
    { speaker: "Voice", text:"Then he noticed another line.\nIt was almost entirely hidden by the frame.\nHe carefully removed the photograph.\nBeneath it, someone had written:"  },
    { speaker: "Detective", text:"Sophia must never find out what happened that night."  },
    { speaker: "Voice", text:"The detective froze."  },
    { speaker: "Voice", text:"Because now an entirely new question had emerged.\nWhat had happened twenty-nine years ago?\nAnd why had Victor Arden been so afraid that Sophia would one day discover the truth?"  },
    { speaker: "Voice", text:"Three months later, the old hotel was closed.\nThe snow had long since melted, the roads were passable again, and the first blades of grass had begun to appear where snowdrifts had once surrounded the building."  },
    { speaker: "Voice", text:"The hotel looked almost peaceful.\nFar too peaceful for a place where Victor Arden’s life had come to an end just a few months earlier.\nA sign hung on the doors:"  },
    { speaker: "Voice", text:"CLOSED UNTIL FURTHER NOTICE."  },
    { speaker: "Voice", text:"Eliza arrived alone. \nShe stood in front of the entrance for a long time before inserting the key.\nThomas had given it to her."  },
    { speaker: "Voice", text:"He had left town back in January and had no intention of returning.\nSophia had left, too.\nNot far away."  },
    { speaker: "Voice", text:"They weren’t living together yet.\nAfter twenty-nine years, there were too many things that couldn’t be fixed in a single conversation."  },
    { speaker: "Voice", text:"But they were talking.\nEvery day.\nSometimes on the phone.\nSometimes for hours.\nSometimes for just a few minutes."  },
    { speaker: "Voice", text:"And Eliza was gradually getting used to an unfamiliar word:"  },
    { speaker: "Voice", text:"Mom."  },
    { speaker: "Voice", text:"At first, it had felt like a stranger’s word.\nNow, it didn’t anymore.\nAlmost nothing in the study had changed."  },
    { speaker: "Voice", text:"The desk.\nThe fireplace.\nThe empty safe.\nAnd the clock.\nThe very same clock."  },
    { speaker: "Voice", text:"Eliza walked over to it.\nThe mechanism had long since been repaired, but the hands remained motionless."  },
    { speaker: "Voice", text:"She took a small envelope from her pocket.\nInside was a photograph."  },
    { speaker: "Voice", text:"The very one showing an eight-year-old girl holding a toy watch.\nEliza placed the photograph on the desk."  },
    { speaker: "Eliza", text:"Hello \n she whispered."  },
    { speaker: "Voice", text:"She wasn’t sure exactly whom she was addressing.\nVictor?\nHer younger self?\nOr the person she might have become if none of this had ever happened?\nThere was no answer."  },
    { speaker: "Voice", text:"She opened the safe.\nThe documents were still inside.\nOld certificates.\nLetters.\nPhotographs."  },
    { speaker: "Voice", text:"Evidence that had lain in darkness for twenty-nine years.\nEliza sorted through the papers.\nAnd found one final letter.\nIt was addressed to Sophia."  },
    { speaker: "Voice", text:"No date.\nNo signature.\nShe unfolded the page."  },
    { speaker: "Letter", text:"I took your daughter away from you not because I loved her more.\nI did it because you were the only person who could destroy my life.\nEliza was not a punishment for you.\nShe was my insurance policy.\nIf you ever discover the truth, it will mean I have nothing left to lose."  },
    { speaker: "Voice", text:"Eliza read the letter twice.\nThen she folded it.\nAnd for the first time in all those years, she felt neither anger nor pain.\nOnly exhaustion."  },
    { speaker: "Voice", text:"A very old exhaustion, as though she had inherited it along with everything else.\nShe tore the letter into several pieces.\nThrew them into the fireplace."  },
    { speaker: "Voice", text:"And watched as the paper slowly turned black.\nThat evening, Eliza left the hotel.\nSophia was waiting for her by the entrance.\nShe was holding two cups of coffee."  },
    { speaker: "Sophia", text:"I didn’t know which kind you liked,” she said. “So I got two different ones."  },
    { speaker: "Voice", text:"Eliza smiled."  },
    { speaker: "Eliza", text:"Which one do you like?"  },
    { speaker: "Sophia", text:"Black coffee."  },
    { speaker: "Eliza", text:"Then this one’s mine."  },
    { speaker: "Voice", text:"Sophia laughed"  },
    { speaker: "Voice", text:"They started walking down the road together.\nFor a while, they remained silent.\nThen Eliza asked:"  },
    { speaker: "Eliza", text:"Mom?"  },
    { speaker: "Voice", text:"Sophia stopped.\nJust for a second.\nBut Eliza noticed."  },
    { speaker: "Sophia", text:"Yes?"  },
    { speaker: "Eliza", text:"What was I like as a child?"  },
    { speaker: "Voice", text:"Sophia looked at her.\nThe woman’s eyes immediately filled with tears."  },
    { speaker: "Sophia", text:"Very curious."  },
    { speaker: "Eliza", text:"Really?"  },
    { speaker: "Sophia", text:"You asked a thousand questions."  },
    { speaker: "Voice", text:"Eliza smirked."  },
    { speaker: "Eliza", text:"Looks like nothing has changed."  },
    { speaker: "Sophia", text:"No."  },
    { speaker: "Voice", text:"Sophia took her hand."  },
    { speaker: "Sophia", text:"Nothing at all."  },
    { speaker: "Voice", text:"They continued walking.\nBehind them, the old hotel stood dark among the trees.\nInside the empty study, the clock had finally been set in motion."  },
    { speaker: "Voice", text:"Its hands began to move slowly forward.\n11:17PM was long past.\nAnd this time, they did not stop."  },


    ];

    function renderLine() {
        document.getElementById('speaker').innerText = story[currentIndex].speaker;
        document.getElementById('text').innerText = story[currentIndex].text;
    }

    renderLine();

    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
    }

    function nextLine() {
        if (currentIndex < story.length - 1) {
            currentIndex++;
            renderLine();
        }
    }

    function claimAchievement(id, amount) {
        const ach = document.getElementById(`ach-${id}`);
        if (ach.classList.contains('claimed')) return;

        ach.classList.remove('completed');
        ach.classList.add('claimed');
        document.getElementById(`btn-claim-${id}`).remove();

        glitters += amount;
        document.getElementById('glitters-display').innerText = glitters;
    }

    function goToMenu() {
        window.location.href = '/';
    }