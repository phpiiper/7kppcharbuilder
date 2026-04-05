'use client'
import {Tooltip, Button, Card, IconButton, Typography, ButtonGroup, Switch} from "@mui/joy";
import {useEffect, useState} from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import {
    TouchApp,
    ThumbUp,
    DirectionsRun,
    Shield,
    People,
    Book,
    Wallpaper,
    CheckCircleOutline,
    Checklist,
    Rocket,
    Visibility
} from "@mui/icons-material"
import { isMobile } from 'react-device-detect'

const STATS = [
    {name: "Charm", boostValue: 15, defaultValue: 25, cat: ["Likeability"],},
    {name: "Eloquence", boostValue: 10, defaultValue: 25, cat: ["Persuasion"],},
    {name: "Beauty", boostValue: 10, defaultValue: 25, cat: ["Likeability"],},
    {name: "Leadership", boostValue: 10, defaultValue: 25, cat: ["Persuasion"],},
    {name: "Self-Defense", boostValue: 10, defaultValue: 0, cat: ["Defensive Instincts"],},
    {name: "Charisma", boostValue: 10, defaultValue: 25, cat: ["Persuasion","Likeability"],},
    {name: "Manipulation", boostValue: 15, defaultValue: 0, cat: ["Persuasion"],},
    {name: "Courage", boostValue: 10, defaultValue: 25, cat: ["Defensive Instincts"],},
    {name: "Intelligence", boostValue: 15, defaultValue: 25, cat: ["Quick Wittedness","Book Smarts"],},
    {name: "Etiquette", boostValue: 15, defaultValue: 25, cat: ["Likeability"],},
    {name: "Grace", boostValue: 15, defaultValue: 25, cat: ["Defensive Instincts"],},
    {name: "Poise", boostValue: 10, defaultValue: 25, cat: ["Persuasion"],},
    {name: "Cunning", boostValue: 10, defaultValue: 0, cat: ["Quick Wittedness","Defensive Instincts"],},
    {name: "Insight", boostValue: 0, defaultValue: 0, cat: ["Persuasion","Quick Wittedness","Interpersonal Insight"],},
    {name: "History", boostValue: 10, defaultValue: 0, cat: ["Book Smarts"],},
    {name: "Politics", boostValue: 10, defaultValue: 0, cat: ["Interpersonal Insight"],},
    {name: "Street Smarts", boostValue: 0, defaultValue: 0, cat: [],},
    {name: "Warfare", boostValue: 0, defaultValue: 0, cat: [],},
    {name: "Practical", boostValue: 0, defaultValue: 0, cat: [],},
    {name: "Academic", boostValue: 10, defaultValue: 0, cat: ["Book Smarts"],},
    {name: "People", boostValue: 15, defaultValue: 0, cat: ["Interpersonal Insight"],},
    {name: "Flora & Fauna", boostValue: 0, defaultValue: 0, cat: [],},
    {name: "Secrets", boostValue: 0, defaultValue: 0, cat: [],}
]
const CATS = {
    Persuasion: <TouchApp
        style={{fontSize: "inherit"}}
    />,
    Likeability: <ThumbUp
        style={{fontSize: "inherit"}}
    />,
    "Quick Wittedness": <DirectionsRun
        style={{fontSize: "inherit"}}
    />,
    "Defensive Instincts": <Shield
        style={{fontSize: "inherit"}}
    />,
    "Interpersonal Insight": <People
        style={{fontSize: "inherit"}}
    />,
    "Book Smarts": <Book
        style={{fontSize: "inherit"}}
    />,
}
const CHOICES = [
    ["Beauty","Intelligence","Charisma","Charm"],
    ["History","Politics","Warfare","Academic"],
    ["Leadership","Courage","Cunning","Manipulation"],
    ["Eloquence","Etiquette","Intelligence","Beauty"],
    ["Street Smarts","Practical","People","Flora & Fauna"],
    ["Self-Defense","Etiquette","Manipulation"],
    ["Intelligence","Manipulation","Courage","Charm"],
    ["Poise","Grace","Cunning","Eloquence"],
    ["Politics","Practical","History","Academic"],
]
const BACKGROUNDS = [
    {
        name: "Daughter of a Notorious Pirate",
        stats: {Charisma: 25, Courage: 25, Cunning: 25, Warfare: 25},
        reqs: {}
    },
    {
        name: "Court Lady",
        stats: {Eloquence: 25, People: 25, Politics: 25},
        reqs: {Politics: ">= 50"}
    },
    {
        name: "Minor Lady with Scholarly Bent",
        stats: {Intelligence: 35, Academics: 35, History: 25},
        reqs: {Intelligence: ">= 50"}
    },
    {
        name: "Ambitious Widow",
        stats: {Charisma: 25, Cunning: 25, People: 25, Politics: 25},
        reqs: {}
    },
    {
        name: "Tomboy Countess",
        stats: {Etiquette: -25, Courage: 25, "Self-Defense": 25},
        reqs: {Courage: ">= 50", Warfare: ">= 25", "Self-Defense": ">= 25"}
    },
    {
        name: "Sheltered Princess",
        stats: {Etiquette: 35, Politics: 15, People: 25},
        reqs: {
            Warfare: "== 0",
            "Street Smarts": "== 0",
            "Self-Defense": "== 0",
            Cunning: "== 0",
            Manipulation: "== 0",
            Courage: "< 50"
        }
    },
]

const defaultCharacter = (useBoost = false, slctBackground) => {
    let c = {
        stats: {},
        backgrounds: BACKGROUNDS.filter(x => Object.keys(x.reqs).length === 0).map(x => x.name)
    }
    STATS.forEach(stat => {
        let affByBg = !!(slctBackground && stat.name in slctBackground.stats)
        c.stats[stat.name] = {...c.stats[stat.name],
            affectedByBackground: affByBg,
            value:  stat.defaultValue +
                (useBoost ? stat.boostValue : 0) +
                (affByBg ? slctBackground.stats[stat.name] : 0)
        }
    })
    return c
}
const canUseBackground = (charStats, background) => {
    if (Object.keys(background.reqs).length === 0) return true
    for (let stat in background.reqs) {
        let remIfAff = background.stats[stat] && charStats[stat].affectedByBackground ? -background.stats[stat] : 0
        if (!eval((charStats[stat].value + remIfAff) + background.reqs[stat])) return false
    }
    return true
}
const createCharacter = (slctOptions, slctBackground, useBoosts=false, useInsight=false) => {
    const slctBG = BACKGROUNDS.find(x => x.name === slctBackground);
    let base = defaultCharacter(useBoosts, slctBG); // + use boosts and BG?
    // add stuff from CHOICES
    for (let i = 0; i < slctOptions.length; i++) {
        let opInd = slctOptions[i]
        if (opInd === -1) continue
        base.stats[CHOICES[i][opInd]].value += 25
        base.stats[CHOICES[i][opInd]].affectedByChoice = true
    }
    // check for usable BACKGROUND
    const bgs =  BACKGROUNDS.filter(x => canUseBackground(base.stats, x))
    base.backgrounds = bgs.map(x => x.name)
    // check for insight?
    if (useInsight) {
        base.stats["Insight"].value = 80
    }

    return base
}

export default function WHSP() {
    const [selectedOptions, setSelectedOptions] = useState(CHOICES.map(x => -1))
    const [selectedBackground, setSelectedBackground] = useState(null)
    const [character, setCharacter] = useState(defaultCharacter())
    const [useBoosts, setUseBoosts] = useState(false)
    const [useInsight, setUseInsight] = useState(false)

    const [viewIcons, setViewIcons] = useState(true)
    const [useMobileView, setUseMobileView] = useState(false)

    useEffect(()=>{
        setUseMobileView(isMobile)
    },[])

    useEffect(() => {
        const newChar = createCharacter(selectedOptions, selectedBackground, useBoosts, useInsight)
        setCharacter(newChar)
    },[selectedOptions,selectedBackground, useBoosts, useInsight])

    return (
        <div className={"page"}>
            <div className={"page-content"}>
                <h1>7KPP Character Builder</h1>

                <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                    <label style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        <Typography level={"body-md"}>Mobile View ({useMobileView ? "ON" : "OFF"}) </Typography>
                        <Switch
                            checked={useMobileView}
                            onChange={(e) => setUseMobileView(e.target.checked)}
                        />
                    </label>

                    <label style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        <Typography level={"body-md"}>View Icons ({viewIcons ? "ON" : "OFF"}) </Typography>
                        <Switch
                            checked={viewIcons}
                            onChange={(e) => setViewIcons(e.target.checked)}
                        />
                    </label>

                    <label style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        <Typography level={"body-md"}>NG+ Boosts ({useBoosts ? "ON" : "OFF"}) </Typography>
                        <Switch
                            checked={useBoosts}
                            onChange={(e) => setUseBoosts(e.target.checked)}
                        />
                    </label>

                    <label style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        <Typography level={"body-md"}>Max Insight ({useInsight ? "ON" : "OFF"}) </Typography>
                        <Switch
                            checked={useInsight}
                            onChange={(e) => setUseInsight(e.target.checked)}
                        />
                    </label>
                </div>

                <Group className={"main-panel"} orientation={useMobileView ? "vertical" : "horizontal"}>
                    <Panel defaultSize="60%" className={"ScrollPanel"}>
                        <Typography level={"title-lg"}>Choices</Typography>
                        <div className={"choice-list"}>
                            {CHOICES.map((ch, index) => <StatChoice
                                key={"stat-choice-" + index}
                                choiceIndex={index+1}
                                options={ch}
                                handleSelect={(ind)=>{
                                    setSelectedOptions(selectedOptions.map((x, i) => {
                                        if (i !== index) return x
                                        return ind
                                    }))
                                }}
                            />)}
                        </div>
                        <Typography level={"title-lg"}>Backgrounds</Typography>
                        <div className={"background-container"}>
                            { BACKGROUNDS.map((bg, index) => <Button
                                key={"background-button-" + index}
                                variant={selectedBackground === bg.name ? "solid" : "outlined"}
                                onClick={() => setSelectedBackground(bg.name)}
                                disabled={!character.backgrounds.includes(bg.name)}
                            >{bg.name}</Button>)}
                        </div>

                    </Panel>
                    <Separator
                         className={"separator"}
                         style={useMobileView ? {
                            width: "100%", height: "4px", margin: "0.5rem 0",
                         } : {}}
                    />
                    <Panel >
                        <Typography level={"h3"}>Main Stats</Typography>
                        <br />
                        <div className={"stats-container"}>
                            {STATS.map((stat, index) => <StatCard
                                key={"stat-card-" + index}
                                stat={stat}
                                character={character}
                                useBoost={useBoosts}
                                useInsight={useInsight}
                                viewIcons={viewIcons}
                            />)}
                        </div>

                        <br /> <hr /> <br />
                        <Typography level={"h3"}>Cumulative Skills</Typography>
                        <br />
                        <div className={"stats-container"}>
                            {Object.keys(CATS).map(cat => <CumulativeStatCard
                                key={"cumulative-stat-card-" + cat}
                                statName={cat}
                                character={character}
                            />)}
                        </div>

                    </Panel>
                </Group>

            </div>

        </div>
    );
}

function StatCard({stat, character, useBoost, useInsight, viewIcons}){
    return (<Card
        className={"stat-div"}
    >
        <Typography level={"title-lg"} display={"flex"} alignItems={"center"} gap={"0.5rem"} textAlign={"center"}>
            {stat.name}
        </Typography>

        <div className={"stat-card-icons-list"} >
            {<AffectedIcons stat={stat} viewIcons={viewIcons}/>}

            {viewIcons && character.stats[stat.name]?.affectedByBackground && (
                <Tooltip
                    title={"Affected by [background selected]"}>
                    <IconButton> <Wallpaper color={"success"} /> </IconButton>
                </Tooltip>
            )}
            {viewIcons && character.stats[stat.name]?.affectedByChoice && (
                <Tooltip
                    title={"Affected by [choice]"}>
                    <IconButton> <CheckCircleOutline color={"success"} /> </IconButton>
                </Tooltip>
            )}
            {viewIcons && character.stats[stat.name] >= 50 && (
                <Tooltip
                    title={"Meets Matchmaker Reqs"}>
                    <IconButton> <Checklist color={"success"} /> </IconButton>
                </Tooltip>
            )}
            {viewIcons && useBoost && STATS.find(x => x.name === stat.name)?.boostValue > 0 && (
                <Tooltip title={"NG+ Boost"}>
                    <IconButton> <Rocket color={"primary"} /> </IconButton>
                </Tooltip>
            )}
            {viewIcons && useInsight && stat.name === "Insight" && (
                <Tooltip title={"Max Insight Boost"}>
                    <IconButton> <Visibility color={"primary"} /> </IconButton>
                </Tooltip>
            )}
        </div>

        <Typography level={"body-md"}>{character.stats[stat.name].value}</Typography>

    </Card>)
}

function CumulativeStatCard({statName, character}){
    return (<Card
        className={"stat-div"}
    >
        <Typography level={"title-lg"} display={"flex"} alignItems={"center"} gap={"0.5rem"} textAlign={"center"}>
            {statName}
        </Typography>
        <Typography level={"body-md"}>
            {STATS.filter(x => x.cat.includes(statName)).map(x => character.stats[x.name].value).reduce((a,b) => a+b, 0)}
        </Typography>
    </Card>)
}

function StatChoice({options=[], handleSelect, choiceIndex}){
    const [selectedInd, setSelectedInd] = useState(-1)
    return <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
        <Typography>C{choiceIndex}</Typography>
        <ButtonGroup>
            {options.map((x, index) => <Button
                key={"button-group-"+index}
                variant={selectedInd === index ? "solid" : "outlined"}
                onClick={() => {
                    setSelectedInd(index)
                    handleSelect(index)
                }}
            >{x}</Button>)}
        </ButtonGroup>
    </div>
}

function AffectedIcons({stat, viewIcons}){
    if (!viewIcons) return <></>
    return <>
        {stat.cat.map(x => <Tooltip
            title={`Affects [${x}] Cumulative Skill`}
            key={"tooltip-"+x}
        >
            <IconButton> {CATS[x]} </IconButton>
        </Tooltip>)}
    </>
}