'use client'
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";



export default function Home() {
    const router = useRouter();
    const stats = ["Charm","Eloquence","Beauty","Leadership","Self-Defense","Charisma","Manipulation","Courage","Intelligence","Etiquette","Grace","Poise","Cunning","Insight","History","Politics","Street Smarts","Warfare","Practical","Academic","People","Flora & Fauna","Secrets"]
    const cumulative = ["Persuasion","Likeability","Quick Wittedness","Defensive Instincts","Interpersonal Insight","Book Smarts"]
    const boosts = [15,10,10,10,10,10,15,10,15,15,15,10,10,0]
    let user_stats = [25,25,25,25,0,25,0,25,25,25,25,25,0,0,0,0,0,0,0,0,0,0,0]
    let choices = [
        ["Beauty","Intelligence","Charisma","Charm"],
        ["History","Politics","Warfare","Academic"],
        ["Leadership","Courage","Cunning","Manipulation"],
        ["Eloquence","Etiquette","Intelligence","Beauty"],
        ["Street Smarts","Practical","People","Animals and Plants"],
        ["Self-Defense","Etiquette","Manipulation","Charm"],
        ["Intelligence","Manipulation","Courage"],
        ["Poise","Intelligence","Cunning","Eloquence"],
        ["Politics","Intelligence","History","Academic"],
    ]

    const backgrounds = [
        // Daughter a of Notorious Pirate (Charisma, Courage, Cunning, Warfare +25) - Default Unlock
        ["Daughter of a Notorious Pirate", [0,0,0,0,0,25,0,25,0,0,0,0,25,0,0,0,0,25,0,0,0,0,0]],
        // Court Lady (Eloquence, People, Politics +25) - Politics > 50
        ["Court Lady", [0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0,25,0,0]],
        // Scholarly Bent (Intelligence, Academics 35+ AND history +25) - Intelligence > 50
        ["Minor Lady with Scholarly Bent", [0,0,0,0,0,0,0,0,35,0,0,0,0,0,25,0,0,0,0,35,0,0,0]],
        // Ambitious Widow (Charisma, Cunning, People, Politics +25) - Expected Unlock
        ["Ambitious Widow", [0,0,0,0,0,25,0,0,0,0,0,0,25,0,0,25,0,0,0,0,25,0,0]],
        // Tomboy (-25 Etiquette, 25+ Courage, Self Defense) - Courage > 50, Warfare > 25, Self Defense > 25
        ["Tomboy Countess", [0,0,0,0,25,0,0,25,0,-25,0,0,0,0,0,0,0,0,0,0,0,0,0]],
        // Sheltered Princess (+35 Etiquette, 15+ Politics, People) - Warfare, Street Smarts, Self Defense, Cunning, Manipulation < 0, Courage < 50
        ["Sheltered Princess", [0,0,0,0,0,0,0,0,0,35,0,0,0,0,0,15,0,0,0,0,15,0,0]],
    ]

    const [finalStats, setFinalStats] = useState(user_stats)
    const [finalCumul, setFinalCumul] = useState([0,0,0,0,0,0])
    const [useBonus, setUseBonus] = useState(false)
    const [useInsight, setUseInsight] = useState(false)
    const [backgroundIndex, setBackgroundIndex] = useState(-1)
    const [enableBackgrounds, setEnableBackgrounds] = useState([true,false,false,true,false,true])

    const getStatsArray = () =>{
        return choices = Array.from(document.getElementsByClassName("choice-list")).map(x => x.dataset.data);
    }
    const setUserStats = () => {
        let stats = calculateChoices(getStatsArray())
        setFinalCumul(calculateCumulative(stats))
        setFinalStats(stats)
        // text (charisma, intelligence, etc)
    }
    const calculateChoices = (array, useBackground=true) => {
        // expect [25,50,75,etc]
        let final_stats = [...user_stats]
        if (useBonus){
            final_stats = user_stats.map((x,i ) => boosts[i] ? x + boosts[i] : x)
        }
        if (useBackground && backgroundIndex !== -1) {
            final_stats = final_stats.map((x,i) => x + backgrounds[backgroundIndex][1][i])
        }
        if (useInsight){
            final_stats[13] += 70;
        }
        for (var i=0; i<array.length; i++){
            let ind = stats.findIndex(x => x === array[i])
            if (ind !== -1) {final_stats[ind] += 25;}
        }
        return final_stats
    }
    const calculateCumulative = (array) => {
        let cumulative = [0,0,0,0,0,0]
        // Persuasion | Charisma, Eloquence, Leadership, Insight, Poise, Manipulation
            cumulative[0] = (array[5] + array[1] + array[3] + array[13] + array[11] + array[6])
        // Likeability Charisma, Charm, Etiquette, Beauty
            cumulative[1] = (array[5] + array[0] + array[9] + array[2])
        // Quick Wittedness | Cunning, Intelligence | Insight
            cumulative[2] = (array[12] + array[13] + array[8])
        // Defensive Instinct | Courage, Cunning, Self Defense, Grace
            cumulative[3] = (array[7] + array[12] + array[4] + array[10])
        // Interpersonal Insight | Politics, Insight, People
            cumulative[4] = (array[15] + array[13] + array[20])
        // Book Smarts | Intelligence, History, Academics
            cumulative[5] = (array[8] + array[14] + array[19])
        return cumulative;

    }
    const setChoice = (event) => {
        let value = event.target.innerText;
        let parent = event.target.parentNode;
            let sc = Array.from(parent.childNodes).find(x => x.classList.contains("selected"));
            if (sc){ sc.classList.remove("selected"); }
        parent.dataset.data = value;
        event.target.classList.add("selected");
        setUserStats()
    }
    const setBackground = (event) => {
        ensureBackgroundStats(calculateChoices(getStatsArray(), false))
        let value = event.target.innerText;
        let parent = event.target.parentNode;
        let index = backgrounds.findIndex(x => x[0] === value)
        let sc = Array.from(parent.childNodes).find(x => x.classList.contains("selected"));
        if (sc){ sc.classList.remove("selected"); }
            if (enableBackgrounds[index]) {
                event.target.classList.add("selected");
                setBackgroundIndex(index)
            } else {
                setBackgroundIndex(-1)
            }
    }

    const ensureBackgroundStats = (array) => {
        let allow = [...enableBackgrounds]
        // if court lady disabled
        allow[1] = array[15] >= 25;
        // if minor lady disabled
        allow[2] = array[8] >= 50;
        // if tomboy disabled
        allow[4] = !(array[4] < 25 || array[7] < 50 || array[17] < 25);
        // if sheltered princess disabled
        allow[5] = !(array[4] >= 25 || array[7] >= 50 || array[17] >= 25 || array[12] >= 25 || array[6] >= 25 || array[16] >= 25);
        setEnableBackgrounds(allow)
        console.log(allow)
        if (backgroundIndex !== -1 && !allow[backgroundIndex]) {
            setBackgroundIndex(-1);
            console.log("disabled: ",backgrounds[backgroundIndex])
            // optional: remove "selected" class from the DOM button
            const choices = Array.from(document.getElementById("background-choice-list").childNodes)
            let ch = choices.find(x => x.classList.contains("selected"))
            if (ch) {
                ch.classList.remove("selected")
            }
        }
    }

    useEffect(() => {
        setUserStats();
    }, [useBonus, useInsight, backgroundIndex]);
    useEffect(() => {
        ensureBackgroundStats(calculateChoices(getStatsArray(), false));
    }, [finalStats]);

    return (
    <div id="page">
      <h1>7KPP Stat Creator</h1>
      <div className={"flex row"} style={{justifyContent: "center", gap: "1rem"}}>
          <button style={{backgroundColor: "#6a7481", color: "white"}} onClick={() => window.location.reload()}>Reload</button>
          <button style={{backgroundColor: useBonus ? "#91f886" : "#f88686"}} onClick={() => setUseBonus(!useBonus)}>NG+ Bonus ({useBonus ? "On" : "Off"})</button>
          <button style={{backgroundColor: useInsight ? "#91f886" : "#f88686"}} onClick={() => setUseInsight(!useInsight)}>Max Insight ({useInsight ? "On" : "Off"})</button>
      </div>
      <div className={"flex row"} id={"qr-container"}>
        <div className={"left"} style={{height: "calc(100vh - 150px)", overflowY: "scroll"}}>
          <h2>Questions</h2>
            {choices.map((x, i) => (<div className={"choice-list"} key={"choice"+i} data-data={undefined}>
                <span>Q{i+1}</span>
                {x.map((y,j) => <button key={"btn-"+i+"-"+j} className={"choice"} onClick={setChoice}>{y}</button>)}
            </div>))}
            <h2>Background</h2>
            <div className={"choice-list"} id={"background-choice-list"}>
                {backgrounds.map((x, i) =>
                    <button key={"bg-"+i} disabled={!enableBackgrounds[i]} className={"choice"} onClick={setBackground}>{x[0]}</button>
                )}
            </div>
        </div>
        <div className={"right"}  style={{height: "calc(100vh - 150px)", overflowY: "scroll"}}>
          <h2>Skills</h2>
            {stats.map((x, i) => (
                <div className={"stat"} key={"stat"+i}>
                    <span className={"stat-number"}>{finalStats[i]}</span>
                    <span className={"stat-name"}>{x} </span>
                    <span className={"stat-min"}>0</span>
                    <input type={"range"} min={0} max={100} value={finalStats[i]} disabled />
                    <span className={"stat-max"}>100</span>
                </div>))}
            <h2>Cumulative</h2>
            {cumulative.map((x, i) => (
                <div className={"flex row"} key={"cumul-"+i}>
                    <div className={"stat-name"}>{cumulative[i]} </div>
                    <div className={"stat-value"}>{finalCumul[i]} </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
