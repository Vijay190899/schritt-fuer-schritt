/* =========================================================================
   SYLLABUS, built from Schritte plus Neu 5 (L1-7) & 6 (L8-14) + A2 recap
   + the official DTZ / telc Deutsch B1 exam skills.

   Block types used by the grammar renderer (see app.js renderBlocks):
     {t:'p',   en, de}                bilingual paragraph
     {t:'table', head:[...], rows:[]} grammar table  (use *word* to highlight)
     {t:'ex',  de, en}                example sentence (use *word* to bold)
     {t:'tip', h, body}               yellow tip
     {t:'warn',h, body}               red "watch out"
     {t:'list',items:[...]}           bullet list

   Quiz question types:
     {type:'mc',   q, en?, options:[...], answer:<index>, explain}
     {type:'fill', q,'... ___ ...', en?, answer:'x' | ['x','y'], explain}
   ========================================================================= */

/* ---- helpers so authoring quiz banks stays short ---- */
const mc  = (q, options, answer, explain, en) => ({ type:'mc', q, options, answer, explain, en });
const fil = (q, answer, explain, en)          => ({ type:'fill', q, answer, explain, en });

export const SYLLABUS = [
/* =====================================================================
   PHASE 0, A2 RECAP  (revision, gentle warm-up)
   ===================================================================== */
{
  phase: 'A2 – Auffrischung', tone:'Erst aufwärmen, dann aufsteigen.',
  color:'#22B981',
  modules: [
    {
      id:'a2-verben', lektion:'A2', title:'Verben & Präsens', subtitle:'Das Fundament: regelmäßig, unregelmäßig, Modalverben',
      color:'#22B981', icon:'🔤',
      goals:['Verben im Präsens sicher konjugieren','Modalverben verwenden','Satzstellung: Verb an Position 2'],
      wortfelder:['Alltag','Tagesablauf','Hobbys'],
      grammar:[
        { id:'praesens', title:'Präsens – regelmäßige Verben', en:'Regular verbs in the present tense', de:'Regelmäßige Verben im Präsens',
          blocks:[
            {t:'p', en:'Take the stem (verb without -en) and add the ending for each person. This is the backbone of German.', de:'Nimm den Stamm (Verb ohne -en) und häng die Endung an. Das ist die Basis von allem.'},
            {t:'table', head:['Person','Endung','lernen'], rows:[['ich','-e','ich *lerne*'],['du','-st','du *lernst*'],['er/sie/es','-t','er *lernt*'],['wir','-en','wir *lernen*'],['ihr','-t','ihr *lernt*'],['sie/Sie','-en','sie *lernen*']]},
            {t:'tip', h:'Verb an Position 2', body:'Im Aussagesatz steht das konjugierte Verb immer an zweiter Stelle: „Heute *lerne* ich Deutsch.“'}
          ]},
        { id:'unregelm', title:'Unregelmäßige Verben & Modalverben', en:'Irregular verbs and modal verbs', de:'Unregelmäßige Verben und Modalverben',
          blocks:[
            {t:'p', en:'Some common verbs change their stem vowel for du/er/sie/es (fahren → du fährst).', de:'Manche Verben ändern den Stammvokal bei du/er/sie/es (fahren → du fährst).'},
            {t:'table', head:['','fahren','essen','sehen','nehmen'], rows:[['ich','fahre','esse','sehe','nehme'],['du','f*ä*hrst','*i*sst','s*ie*hst','n*i*mmst'],['er/sie','f*ä*hrt','*i*sst','s*ie*ht','n*i*mmt']]},
            {t:'p', en:'Modal verbs (can, must, want…) send the main verb to the very end as an infinitive.', de:'Modalverben (können, müssen, wollen…) schicken das Hauptverb ans Satzende – im Infinitiv.'},
            {t:'ex', de:'Ich *muss* heute viel *lernen*.', en:'I have to study a lot today.'},
            {t:'table', head:['','können','müssen','wollen','dürfen'], rows:[['ich','kann','muss','will','darf'],['du','kannst','musst','willst','darfst'],['er/sie','kann','muss','will','darf']]}
          ]}
      ],
      quiz:[
        mc('Wähle die richtige Form: „Er ___ jeden Tag Deutsch.“',['lerne','lernst','lernt','lernen'],2,'er/sie/es → Endung -t.','He ___ German every day.'),
        mc('„Du ___ zu schnell!“ (fahren)',['fahrst','fährst','fahren','fährt'],1,'fahren ist unregelmäßig: du fährst (a→ä).'),
        mc('„Ich ___ heute nicht kommen.“',['kann','kannst','könnt','können'],0,'ich → kann (Modalverb, keine Endung).'),
        fil('Ergänze: „Wir ___ am Wochenende ins Kino.“ (gehen)','gehen','wir → -en.'),
        mc('Wo steht das Hauptverb bei Modalverben?',['an Position 1','an Position 2','am Satzende (Infinitiv)','egal'],2,'Modalverb an Position 2, Hauptverb (Infinitiv) am Ende.'),
        fil('„Du ___ zu viel.“ (essen → du-Form)','isst','essen: du isst (e→i).'),
        mc('„___ ihr Deutsch?“ (sprechen)',['Spricht','Sprecht','Sprichst','Sprechen'],1,'ihr → -t: ihr sprecht.'),
        mc('„Sie ___ ein neues Auto.“ (wollen, 3. Pers. Sg.)',['will','willst','wollen','wollt'],0,'sie (sg.) → will.'),
        fil('„Er ___ einen Apfel.“ (nehmen)','nimmt','nehmen: er nimmt (e→i, m verdoppelt).'),
        mc('Welcher Satz ist korrekt?',['Ich jeden Tag arbeite.','Jeden Tag ich arbeite.','Jeden Tag arbeite ich.','Arbeite jeden Tag ich.'],2,'Verb an Position 2 → „Jeden Tag arbeite ich.“'),
        mc('„Wir ___ heute nicht.“ (müssen)',['muss','musst','müssen','müsst'],2,'wir → müssen.'),
        fil('„___ du mir helfen?“ (können, du-Form)','Kannst','können: du kannst.')
      ]
    },
    {
      id:'a2-kasus', lektion:'A2', title:'Artikel & Fälle', subtitle:'Nominativ, Akkusativ, Dativ – der/die/das im Wandel',
      color:'#0EA5A0', icon:'📇',
      goals:['Nominativ, Akkusativ und Dativ erkennen','Artikel richtig deklinieren','Frage: Wer? Wen? Wem?'],
      wortfelder:['Gegenstände','Familie','Wohnung'],
      grammar:[
        { id:'faelle', title:'Die drei Fälle', en:'The three cases', de:'Die drei Fälle',
          blocks:[
            {t:'p', en:'Nominative = the subject (who does it). Accusative = the direct object (whom/what). Dative = the indirect object (to whom).', de:'Nominativ = das Subjekt (wer?). Akkusativ = das direkte Objekt (wen/was?). Dativ = das indirekte Objekt (wem?).'},
            {t:'table', head:['','Nominativ','Akkusativ','Dativ'], rows:[['maskulin','der / ein','*den / einen*','*dem / einem*'],['neutral','das / ein','das / ein','*dem / einem*'],['feminin','die / eine','die / eine','*der / einer*'],['Plural','die / –','die / –','*den … -n*']]},
            {t:'tip', h:'Nur der Maskulinum ändert sich im Akkusativ!', body:'der → den. das, die, Plural bleiben im Akkusativ gleich. Das macht 50% der Fehler weg.'},
            {t:'ex', de:'*Der* Mann gibt *dem* Kind *den* Ball.', en:'The man (Nom) gives the child (Dat) the ball (Akk).'}
          ]}
      ],
      quiz:[
        mc('„Ich sehe ___ Mann.“',['der','den','dem','ein'],1,'sehen + Akkusativ, maskulin → den.'),
        mc('„Ich helfe ___ Frau.“',['die','der','den','das'],1,'helfen + Dativ, feminin → der.'),
        fil('„Er gibt ___ Kind einen Apfel.“ (Dativ, neutral)','dem','Dativ neutral → dem.'),
        mc('Welcher Fall ist „den Ball“?',['Nominativ','Akkusativ','Dativ','Genitiv'],1,'den = maskulin Akkusativ.'),
        mc('„___ Auto ist neu.“ (Nominativ, neutral)',['Der','Das','Dem','Den'],1,'Nominativ neutral → das.'),
        fil('„Ich danke ___ Lehrer.“ (Dativ, maskulin)','dem','danken + Dativ → dem Lehrer.'),
        mc('„Wir besuchen ___ Großeltern.“ (Akkusativ Plural)',['der','den','die','dem'],2,'Akkusativ Plural → die.'),
        mc('Welche Frage passt zum Dativ?',['Wer?','Wen/Was?','Wem?','Wessen?'],2,'Dativ fragt: Wem?'),
        fil('„Ich kaufe ___ Blume.“ (Akkusativ, feminin)','eine','Akkusativ feminin → eine (bleibt wie Nominativ).'),
        mc('„Das Buch gehört ___ Mann.“',['der','den','dem','das'],2,'gehören + Dativ, maskulin → dem.'),
        mc('„___ Kinder spielen im Garten.“ (Nominativ Plural)',['Der','Die','Den','Dem'],1,'Nominativ Plural → die.')
      ]
    },
    {
      id:'a2-perfekt', lektion:'A2', title:'Perfekt (Vergangenheit)', subtitle:'Über Gestern sprechen: haben/sein + Partizip II',
      color:'#F5A623', icon:'⏪',
      goals:['Das Perfekt bilden','haben oder sein wählen','Partizip II regelmäßiger & unregelmäßiger Verben'],
      wortfelder:['Wochenende','Reise','Erlebnisse'],
      grammar:[
        { id:'perfekt', title:'Das Perfekt', en:'The present perfect (spoken past)', de:'Das Perfekt (gesprochene Vergangenheit)',
          blocks:[
            {t:'p', en:'For the past in speech, Germans use PERFEKT: a helper verb (haben/sein) in position 2 + the past participle (Partizip II) at the end.', de:'Beim Sprechen benutzt man das Perfekt: Hilfsverb (haben/sein) an Position 2 + Partizip II am Satzende.'},
            {t:'ex', de:'Ich *habe* gestern Fußball *gespielt*.', en:'I played football yesterday.'},
            {t:'p', en:'Regular participle: ge- + stem + -t (gespielt). Irregular: ge- + …-en, often with vowel change (gegessen, gefahren).', de:'Regelmäßig: ge- + Stamm + -t (gespielt). Unregelmäßig: ge- + …-en, oft mit Vokalwechsel (gegessen, gefahren).'},
            {t:'table', head:['Infinitiv','Partizip II','Hilfsverb'], rows:[['machen','ge*mach*t','haben'],['essen','ge*gess*en','haben'],['gehen','ge*gang*en','*sein*'],['fahren','ge*fahr*en','*sein*'],['telefonieren','telefonier*t*','haben']]},
            {t:'warn', h:'sein bei Bewegung/Veränderung', body:'Verben der Bewegung (gehen, fahren, kommen) und Zustandsänderung (aufstehen, einschlafen) nehmen SEIN: „Ich *bin* nach Berlin *gefahren*.“'},
            {t:'tip', h:'Verben auf -ieren', body:'Kein ge-! studieren → studiert, telefonieren → telefoniert.'}
          ]}
      ],
      quiz:[
        mc('„Ich ___ gestern Pizza gegessen.“',['bin','habe','hat','ist'],1,'essen → haben.'),
        mc('„Wir ___ nach Italien gefahren.“',['haben','sind','habt','seid'],1,'fahren (Bewegung) → sein.'),
        fil('Partizip II von „machen“: ich habe es ___','gemacht','regelmäßig: ge+mach+t.'),
        fil('Partizip II von „gehen“: ich bin ___','gegangen','unregelmäßig: gegangen (+ sein).'),
        mc('„Sie ___ zwei Stunden telefoniert.“',['ist','hat','habt','sind'],1,'telefonieren → haben, Partizip „telefoniert“ (kein ge-).'),
        mc('Welches Verb nimmt „sein“?',['kaufen','schlafen','aufstehen','lesen'],2,'aufstehen = Zustandsänderung → sein.'),
        fil('„Er ___ um 7 Uhr aufgestanden.“ (Hilfsverb)','ist','aufstehen → sein.'),
        mc('Partizip II von „studieren“?',['gestudiert','studiert','gestudieren','studierte'],1,'-ieren-Verben: kein ge- → studiert.'),
        mc('„___ du gestern gearbeitet?“',['Bist','Hast','Habt','Bin'],1,'arbeiten → haben.'),
        fil('Partizip II von „trinken“: ich habe ___','getrunken','unregelmäßig: getrunken.'),
        mc('„Das Kind ___ schnell eingeschlafen.“',['hat','ist','habt','seid'],1,'einschlafen (Zustandsänderung) → sein.')
      ]
    }
  ]
},

/* =====================================================================
   PHASE 1, B1.1  (Schritte plus Neu 5, Lektion 1-7)
   ===================================================================== */
{
  phase:'B1.1 · Schritte 5 (Lektion 1-7)', tone:'Jetzt beginnt B1. Du schaffst das.', color:'#5B7FFF',
  modules:[
    {
      id:'b1-l1', lektion:1, title:'Ankommen', subtitle:'Aller Anfang ist schwer',
      color:'#5B7FFF', icon:'🧳',
      goals:['Gründe nennen (weil)','über Erlebnisse berichten (Perfekt)','über Familie sprechen'],
      wortfelder:['Familie & Verwandte','Wohn- & Lebensformen'],
      grammar:[
        { id:'weil', title:'Konjunktion „weil“', en:'The conjunction „weil“ (because)', de:'Die Konjunktion „weil“',
          blocks:[
            {t:'p', en:'„weil“ gives a reason. It is a subordinating conjunction, so the conjugated verb jumps to the END of its clause.', de:'„weil“ nennt einen Grund. Es ist eine Nebensatz-Konjunktion – das Verb steht am ENDE.'},
            {t:'ex', de:'Ich bin traurig, *weil* ich hier keine Freunde *habe*.', en:'I am sad because I have no friends here.'},
            {t:'table', head:['Hauptsatz','','Nebensatz (Verb am Ende)'], rows:[['Ich lerne Deutsch,','weil','ich in Deutschland *leben will*.'],['Sie ist müde,','weil','sie schlecht *geschlafen hat*.']]},
            {t:'tip', h:'Komma nicht vergessen', body:'Vor „weil“ steht immer ein Komma. Und: Modalverb/Hilfsverb steht ganz am Ende.'}
          ]},
        { id:'perfekt-typ', title:'Perfekt: trennbar, nicht trennbar, -ieren', en:'Perfect of separable, inseparable and -ieren verbs', de:'Perfekt der trennbaren, nicht trennbaren und -ieren-Verben',
          blocks:[
            {t:'table', head:['Typ','Beispiel','Partizip II'], rows:[['trennbar','kennenlernen','kennen*ge*lernt'],['trennbar','einkaufen','ein*ge*kauft'],['nicht trennbar','erleben','*erlebt* (kein ge-)'],['nicht trennbar','bekommen','*bekommen*'],['-ieren','passieren','*passiert*'],['-ieren','telefonieren','*telefoniert*']]},
            {t:'p', en:'Separable verbs put -ge- in the MIDDLE. Inseparable (be-, er-, ver-, ent-…) and -ieren verbs take NO ge-.', de:'Trennbare Verben: -ge- in die MITTE. Nicht trennbare (be-, er-, ver-, ent-…) und -ieren-Verben: KEIN ge-.'},
            {t:'ex', de:'Ich *habe* sie letztes Jahr *kennengelernt*.', en:'I met her last year.'}
          ]},
        { id:'genitiv-namen', title:'Genitiv bei Namen & Präposition „von“', en:'Genitive with names & the preposition „von“', de:'Genitiv bei Namen und die Präposition „von“',
          blocks:[
            {t:'p', en:'To show possession with a name, add -s (no apostrophe): Annas Mutter. In everyday speech you can also say „von“ + Dativ.', de:'Besitz bei Namen: einfach -s anhängen (kein Apostroph): Annas Mutter. Umgangssprachlich auch „von“ + Dativ.'},
            {t:'ex', de:'Das ist *Annas* Mutter. = Das ist die Mutter *von Anna*.', en:'That is Anna’s mother.'}
          ]}
      ],
      quiz:[
        mc('„Ich lerne Deutsch, weil ich einen Job ___.“',['suche','ich suche','suchen','gesucht'],0,'Nebensatz mit weil: Verb am Ende → „…weil ich einen Job suche.“'),
        mc('Welcher Satz ist korrekt?',['Ich bleibe hier, weil ich habe Familie.','Ich bleibe hier, weil ich Familie habe.','Ich bleibe hier, weil habe ich Familie.','Ich bleibe hier weil Familie ich habe.'],1,'weil → Verb ans Ende: „…weil ich Familie habe.“'),
        fil('Perfekt von „kennenlernen“: Wir haben uns 2019 ___.','kennengelernt','trennbar: kennen-ge-lernt.'),
        mc('Partizip II von „erleben“?',['geerlebt','erlebt','geerlebte','erlebte'],1,'nicht trennbar (er-): kein ge- → erlebt.'),
        fil('Partizip II von „passieren“: Was ist ___?','passiert','-ieren: kein ge- → passiert.'),
        mc('„Das ist ___ Mutter.“ (Anna, Genitiv)',['Anna','Annas','von Anna die','Annes'],1,'Name + s → Annas Mutter.'),
        mc('„Sie ist glücklich, ___ sie eine Wohnung gefunden hat.“',['denn','weil','deshalb','trotzdem'],1,'Grund im Nebensatz → weil (Verb am Ende bestätigt es).'),
        fil('Ergänze: „Ich bin nervös, weil ich morgen eine Prüfung ___.“ (haben)','habe','Verb am Ende, ich → habe.'),
        mc('Partizip II von „einkaufen“?',['eingekauft','geeinkauft','einkaufen','einkauft'],0,'trennbar: ein-ge-kauft.'),
        mc('Umgangssprachlich für „Peters Auto“:',['das Auto Peters','das Auto von Peter','Peter Auto','von Peters Auto'],1,'von + Dativ → das Auto von Peter.'),
        fil('„…, weil das Wetter schlecht ___.“ (sein, Präsens)','ist','Verb am Ende → ist.'),
        mc('Welches Verb bildet das Partizip OHNE ge-?',['spielen','machen','verstehen','kaufen'],2,'ver- ist nicht trennbar → verstanden (kein ge-).')
      ]
    },
    {
      id:'b1-l2', lektion:2, title:'Zu Hause', subtitle:'Was man hat, das hat man',
      color:'#7BC950', icon:'🏠',
      goals:['sagen wo/wohin (Wechselpräpositionen)','über Wohnen sprechen','um Hilfe bitten'],
      wortfelder:['Wohnung','Mietshaus','Zusammenleben'],
      grammar:[
        { id:'wechsel', title:'Wechselpräpositionen', en:'Two-way prepositions (Wo? Dativ / Wohin? Akkusativ)', de:'Wechselpräpositionen (Wo? Dativ / Wohin? Akkusativ)',
          blocks:[
            {t:'p', en:'Nine prepositions take Dative when there is NO movement (Wo? = location) and Accusative when there IS movement to a place (Wohin? = direction).', de:'Neun Präpositionen: Dativ ohne Bewegung (Wo? = Ort), Akkusativ mit Bewegung zu einem Ziel (Wohin? = Richtung).'},
            {t:'list', items:['in, an, auf, über, unter, vor, hinter, neben, zwischen']},
            {t:'table', head:['Frage','Fall','Beispiel'], rows:[['Wo? (Ort)','Dativ','Die Lampe hängt an *der* Decke.'],['Wohin? (Richtung)','Akkusativ','Ich hänge die Lampe an *die* Decke.']]},
            {t:'p', en:'Position verbs (stehen, liegen, hängen, sitzen) + Wo? = Dative. Placement verbs (stellen, legen, hängen, setzen) + Wohin? = Accusative.', de:'Positionsverben (stehen, liegen, hängen, sitzen) + Wo? = Dativ. Handlungsverben (stellen, legen, hängen, setzen) + Wohin? = Akkusativ.'},
            {t:'table', head:['Wohin? (Akk.)','↔','Wo? (Dativ)'], rows:[['stellen (ich stelle)','','stehen (es steht)'],['legen (ich lege)','','liegen (es liegt)'],['hängen (ich hänge)','','hängen (es hängt)']]},
            {t:'ex', de:'Ich *stelle* die Flasche auf *den* Tisch. → Die Flasche *steht* auf *dem* Tisch.', en:'I put the bottle on the table. → The bottle is (standing) on the table.'}
          ]}
      ],
      quiz:[
        mc('„Das Bild hängt an ___ Wand.“ (Wo?)',['die','der','das','den'],1,'Wo? → Dativ, feminin → der.'),
        mc('„Ich hänge das Bild an ___ Wand.“ (Wohin?)',['die','der','das','dem'],0,'Wohin? → Akkusativ, feminin → die.'),
        fil('„Die Katze liegt auf ___ Sofa.“ (Wo?, neutral)','dem','Wo? Dativ neutral → dem.'),
        mc('„Er legt das Buch auf ___ Tisch.“',['dem','der','den','das'],2,'legen = Wohin? Akkusativ, maskulin → den.'),
        mc('Welches Verb ist ein Positionsverb (Wo?)?',['stellen','legen','stehen','setzen'],2,'stehen = Position → Dativ.'),
        fil('„Die Schuhe stehen vor ___ Tür.“ (Wo?, feminin)','der','Wo? Dativ feminin → der.'),
        mc('„Stell die Vase ___ Regal!“ (Wohin?, neutral)',['im','ins','in dem','am'],1,'in + das = ins (Wohin? Akkusativ).'),
        mc('„Das Auto steht ___ Garage.“ (Wo?)',['in die','in der','in den','ins'],1,'Wo? → in der Garage.'),
        fil('„Ich setze mich neben ___ Fenster.“ (Wohin?, neutral)','das','Wohin? Akkusativ neutral → das.'),
        mc('Welcher Satz beschreibt eine Bewegung (Akkusativ)?',['Das Glas steht auf dem Tisch.','Ich stelle das Glas auf den Tisch.','Die Lampe hängt über dem Bett.','Der Teppich liegt auf dem Boden.'],1,'stellen + auf den Tisch = Richtung → Akkusativ.'),
        mc('„Zwischen ___ Häusern ist ein Park.“ (Wo?, Plural)',['die','den','der','das'],1,'Dativ Plural → den (+ -n am Nomen).')
      ]
    },
    {
      id:'b1-l3', lektion:3, title:'Essen und Trinken', subtitle:'Eine Hand wäscht die andere',
      color:'#FF7A59', icon:'🍽️',
      goals:['Häufigkeit ausdrücken','im Restaurant bestellen','Indefinitpronomen benutzen'],
      wortfelder:['Geschirr','Essen & Mahlzeiten','im Restaurant'],
      grammar:[
        { id:'indefinit', title:'Indefinitpronomen: einer / eine / eins – keiner …', en:'Indefinite pronouns (one / none)', de:'Indefinitpronomen im Nominativ und Akkusativ',
          blocks:[
            {t:'p', en:'These replace a noun you already mentioned: „Möchtest du einen Apfel?“ – „Ja, ich möchte einen.“ They take the same endings as ein-/kein- but stand alone.', de:'Sie ersetzen ein schon genanntes Nomen: „Möchtest du einen Apfel?“ – „Ja, ich möchte einen.“ Endungen wie bei ein-/kein-, aber ohne Nomen.'},
            {t:'table', head:['','Nominativ','Akkusativ'], rows:[['maskulin','einer / keiner','*einen / keinen*'],['neutral','ein*s* / kein*s*','ein*s* / kein*s*'],['feminin','eine / keine','eine / keine'],['Plural','welche / keine','welche / keine']]},
            {t:'ex', de:'Ist hier ein Stuhl frei? – Ja, hier ist *einer*. / Nein, hier ist *keiner*.', en:'Is a chair free here? – Yes, here is one. / No, there is none.'}
          ]}
      ],
      quiz:[
        mc('„Hast du einen Kuli?“ – „Ja, ich habe ___.“',['einer','einen','eins','ein'],1,'Akkusativ maskulin → einen.'),
        mc('„Ist noch Milch da?“ – „Nein, es ist ___ mehr da.“',['keiner','keine','keins','kein'],1,'feminin (die Milch) Nom. → keine.'),
        fil('„Möchtest du ein Ei?“ – „Ja, ich nehme ___.“ (neutral, Akk.)','eins','neutral Akkusativ → eins.'),
        mc('„Hier ist ein Platz frei.“ – „Super, da ist ___!“',['einer','einen','eins','ein'],0,'Nominativ maskulin (der Platz) → einer.'),
        mc('„Hast du Äpfel?“ – „Nein, ich habe ___.“',['keiner','keine','keins','welche'],1,'Plural → keine.'),
        fil('„Brauchst du einen Löffel?“ – „Nein danke, ich habe schon ___.“','einen','Akkusativ maskulin → einen.'),
        mc('„Gibt es hier einen Bäcker?“ – „Ja, da vorne ist ___.“',['einen','einer','eins','welche'],1,'Nominativ maskulin → einer.'),
        mc('„Möchten Sie Tomaten?“ – „Ja, ich nehme ___.“',['einen','eine','welche','eins'],2,'Plural, unbestimmte Menge → welche.'),
        fil('„Ist das dein Stift?“ – „Nein, das ist ___.“ (kein, mask. Nom.)','keiner','Nominativ maskulin → keiner.'),
        mc('„Haben wir noch Brot?“ – „Nein, wir haben ___ mehr.“',['keiner','keine','keins','kein'],2,'neutral (das Brot) → keins.')
      ]
    },
    {
      id:'b1-l4', lektion:4, title:'Arbeitswelt', subtitle:'Glück muss der Mensch haben!',
      color:'#F5C451', icon:'💼',
      goals:['Bedingungen ausdrücken (wenn)','Ratschläge geben (Konjunktiv II: sollte)','am Arbeitsplatz telefonieren'],
      wortfelder:['Arbeit & Freizeit','Betrieb / Firma','Hotel'],
      grammar:[
        { id:'wenn', title:'Konjunktion „wenn“ (Bedingung)', en:'„wenn“ = if / when (condition)', de:'Die Konjunktion „wenn“',
          blocks:[
            {t:'p', en:'„wenn“ introduces a condition; like all subordinate clauses, the verb goes to the end. If the wenn-clause comes first, the main clause starts with its verb.', de:'„wenn“ nennt eine Bedingung; Verb am Ende. Steht der wenn-Satz vorne, beginnt der Hauptsatz mit dem Verb.'},
            {t:'ex', de:'*Wenn* Sie keine Bestätigung *haben*, kann ich Ihnen kein Zimmer geben.', en:'If you have no confirmation, I can’t give you a room.'}
          ]},
        { id:'konj2-sollte', title:'Konjunktiv II: „sollte“ – Ratschläge', en:'Conjunctive II „sollte“ for advice', de:'Konjunktiv II „sollte“ für Ratschläge',
          blocks:[
            {t:'p', en:'Use „sollte“ to give friendly advice, softer than „müssen“. Main verb goes to the end as infinitive.', de:'„sollte“ gibt einen freundlichen Rat, weicher als „müssen“. Hauptverb im Infinitiv am Ende.'},
            {t:'table', head:['Person','Form'], rows:[['ich','sollte'],['du','solltest'],['er/sie','sollte'],['wir/sie','sollten'],['ihr','solltet']]},
            {t:'ex', de:'Du *solltest* mehr *schlafen*. Du *solltest* Detektiv *werden*.', en:'You should sleep more. You should become a detective.'}
          ]}
      ],
      quiz:[
        mc('„Wenn es morgen ___, bleiben wir zu Hause.“ (regnen)',['regnet','es regnet','regnen','geregnet'],0,'wenn-Satz: Verb am Ende → regnet.'),
        mc('Ratschlag: „Du bist müde. Du ___ mehr schlafen.“',['musst','sollst','solltest','willst'],2,'freundlicher Rat → solltest (Konjunktiv II).'),
        fil('„Wenn ich Zeit ___, helfe ich dir.“ (haben)','habe','wenn-Satz Verb am Ende → habe.'),
        mc('„___ du krank bist, geh zum Arzt.“',['Weil','Wenn','Dass','Obwohl'],1,'Bedingung → Wenn.'),
        mc('Welcher Satz ist korrekt?',['Wenn ich habe Zeit, ich komme.','Wenn ich Zeit habe, komme ich.','Wenn ich Zeit habe, ich komme.','Ich komme, wenn habe ich Zeit.'],1,'wenn-Satz vorne → Hauptsatz beginnt mit Verb: „…, komme ich.“'),
        fil('„Ihr ___ pünktlicher sein.“ (sollte, ihr-Form)','solltet','ihr → solltet.'),
        mc('„Sie ___ zum Arzt gehen.“ (Rat, Sie-Form)',['soll','sollen','solltet','sollten'],3,'Sie → sollten.'),
        mc('„Wenn du Hilfe ___, ruf mich an.“',['brauchst','brauchen','gebraucht','du brauchst'],0,'du → brauchst, am Ende.'),
        fil('Gib einen Rat: „Du rauchst zu viel. Du ___ aufhören.“','solltest','Konjunktiv II du → solltest.'),
        mc('„Wenn das Wetter schön ist, ___ wir spazieren.“',['gehen','wir gehen','gehen wir','geht'],2,'Hauptsatz nach Nebensatz → Verb zuerst: „gehen wir“.')
      ]
    },
    {
      id:'b1-l5', lektion:5, title:'Sport und Fitness', subtitle:'Übung macht den Meister!',
      color:'#0EA5A0', icon:'🏃',
      goals:['reflexive Verben benutzen','Verben mit Präpositionen','nach Interessen fragen (Worauf? – Darauf)'],
      wortfelder:['Sport & Sportarten','Gesundheit & Fitness'],
      grammar:[
        { id:'reflexiv', title:'Reflexive Verben', en:'Reflexive verbs', de:'Reflexive Verben',
          blocks:[
            {t:'p', en:'The action refers back to the subject, using a reflexive pronoun (mich, dich, sich…).', de:'Die Handlung bezieht sich auf das Subjekt zurück – mit Reflexivpronomen (mich, dich, sich…).'},
            {t:'table', head:['Person','Pronomen','Beispiel'], rows:[['ich','mich','ich bewege *mich*'],['du','dich','du ruhst *dich* aus'],['er/sie','sich','er interessiert *sich*'],['wir','uns','wir treffen *uns*'],['ihr','euch','ihr freut *euch*'],['sie/Sie','sich','sie freuen *sich*']]}
          ]},
        { id:'verb-praep', title:'Verben mit Präpositionen & Präpositionaladverbien', en:'Verbs with prepositions & pronominal adverbs', de:'Verben mit Präpositionen und Präpositionaladverbien',
          blocks:[
            {t:'p', en:'Many verbs need a fixed preposition: sich interessieren FÜR, warten AUF, sich treffen MIT. Learn verb+preposition together!', de:'Viele Verben brauchen eine feste Präposition: sich interessieren FÜR, warten AUF, sich treffen MIT. Immer zusammen lernen!'},
            {t:'p', en:'For things, ask „Wo(r)+preposition?“ and answer „Da(r)+preposition“: Worauf wartest du? – Darauf. For people, use preposition + question word: Auf wen? – Auf ihn.', de:'Bei Sachen: Frage „Wo(r)+Präposition?“, Antwort „Da(r)+Präposition“: Worauf wartest du? – Darauf. Bei Personen: Präposition + Fragewort: Auf wen? – Auf ihn.'},
            {t:'ex', de:'*Worauf* freust du dich? – Ich freue mich *darauf*.', en:'What are you looking forward to? – I’m looking forward to it.'}
          ]}
      ],
      quiz:[
        mc('„Ich interessiere ___ für Sport.“',['mir','mich','sich','uns'],1,'ich → mich.'),
        mc('„Wir treffen ___ am Bahnhof.“',['sich','uns','euch','mich'],1,'wir → uns.'),
        fil('„Er freut ___ auf das Wochenende.“','sich','er → sich.'),
        mc('„Ich warte ___ den Bus.“ (feste Präposition)',['für','auf','über','an'],1,'warten AUF.'),
        mc('„___ interessierst du dich?“ (nach einer Sache fragen)',['Wofür','Für wen','Woran','Auf was'],0,'Sache + für → Wofür.'),
        fil('Antwort: „Ich interessiere mich ___.“ (dafür/für die Musik)','dafür','Sache → da(r)+für = dafür.'),
        mc('„Sie ärgert ___ über den Lärm.“',['mich','dich','sich','uns'],2,'sie → sich.'),
        mc('„Auf wen wartest du?“ – „___.“',['Darauf','Auf ihn','Worauf','Aufihn'],1,'Person → Präposition + Pronomen: Auf ihn.'),
        fil('„Kinder, freut ___ nicht zu früh!“ (ihr-Form)','euch','ihr → euch.'),
        mc('Welche Präposition passt: „sich treffen ___ Freunden“?',['auf','für','mit','über'],2,'sich treffen MIT.')
      ]
    },
    {
      id:'b1-l6', lektion:6, title:'Schule und Ausbildung', subtitle:'Von nichts kommt nichts',
      color:'#8B7CF6', icon:'🎓',
      goals:['über die Vergangenheit erzählen (Präteritum Modalverben)','die Meinung sagen (dass)','über den Berufsweg sprechen'],
      wortfelder:['Schule & Schularten','Ausbildung & Beruf'],
      grammar:[
        { id:'praet-modal', title:'Präteritum der Modalverben', en:'Simple past of modal verbs', de:'Präteritum der Modalverben',
          blocks:[
            {t:'p', en:'Modal verbs are used in the simple past even in speech. They LOSE the umlaut.', de:'Modalverben stehen auch beim Sprechen im Präteritum. Sie VERLIEREN den Umlaut.'},
            {t:'table', head:['','können','müssen','wollen','dürfen'], rows:[['ich','konnte','musste','wollte','durfte'],['du','konntest','musstest','wolltest','durftest'],['er/sie','konnte','musste','wollte','durfte'],['wir/sie','konnten','mussten','wollten','durften']]},
            {t:'ex', de:'Als Kind *wollte* ich Ärztin werden, aber ich *konnte* nicht studieren.', en:'As a child I wanted to be a doctor, but I couldn’t study.'}
          ]},
        { id:'dass', title:'Konjunktion „dass“', en:'The conjunction „dass“ (that)', de:'Die Konjunktion „dass“',
          blocks:[
            {t:'p', en:'„dass“ links an opinion/fact to a main clause; verb goes to the end.', de:'„dass“ verbindet eine Meinung/Tatsache mit dem Hauptsatz; Verb am Ende.'},
            {t:'ex', de:'Es ist wichtig, *dass* man einen guten Schulabschluss *hat*.', en:'It is important that one has a good school-leaving certificate.'}
          ]}
      ],
      quiz:[
        mc('Präteritum: „Ich ___ gestern nicht kommen.“ (können)',['kann','konnte','könnte','gekonnt'],1,'können → konnte (kein Umlaut).'),
        mc('„Als Kind ___ ich viel lernen.“ (müssen)',['muss','müsste','musste','gemusst'],2,'müssen → musste.'),
        fil('„Wir ___ als Kinder früh aufstehen.“ (müssen, Präteritum)','mussten','wir → mussten.'),
        mc('„Ich glaube, ___ er recht hat.“',['weil','dass','wenn','ob'],1,'Meinung → dass.'),
        mc('Welcher Satz ist korrekt?',['Ich denke, dass er kommt morgen.','Ich denke, dass er morgen kommt.','Ich denke, dass kommt er morgen.','Ich denke dass er morgen kommen.'],1,'dass → Verb am Ende: „…dass er morgen kommt.“'),
        fil('„Sie ___ als Jugendliche nicht ausgehen.“ (dürfen, Präteritum)','durfte','dürfen → durfte.'),
        mc('„Es ist gut, ___ du Deutsch lernst.“',['weil','ob','dass','wenn'],2,'Tatsache/Wertung → dass.'),
        mc('„Früher ___ man hier rauchen.“ (dürfen, Präteritum, man)',['darf','durfte','dürfte','durften'],1,'man → durfte.'),
        fil('„Ich wusste nicht, ___ die Prüfung so schwer ist.“','dass','Nebensatz mit dass.'),
        mc('Präteritum von „wollen“ (ich):',['will','wollte','wollen','gewollt'],1,'wollen → wollte.')
      ]
    },
    {
      id:'b1-l7', lektion:7, title:'Feste und Geschenke', subtitle:'Das kannst du laut sagen',
      color:'#EC4899', icon:'🎁',
      goals:['Bitten & Empfehlungen ausdrücken','über Geschenke sprechen','Dativobjekte richtig stellen'],
      wortfelder:['Geschenke','Hochzeit','Feste'],
      grammar:[
        { id:'dativobjekt', title:'Dativ als Objekt & Stellung der Objekte', en:'Dative object & word order of objects', de:'Dativ als Objekt und die Stellung der Objekte',
          blocks:[
            {t:'p', en:'Some verbs (geben, schenken, empfehlen, zeigen) take BOTH a dative (to whom) and an accusative (what). Rule of order:', de:'Manche Verben (geben, schenken, empfehlen, zeigen) haben Dativ (wem) UND Akkusativ (was). Reihenfolge:'},
            {t:'list', items:['Zwei Nomen → Dativ vor Akkusativ: „Ich gebe *dem Kind* *den Ball*.“','Ist der Akkusativ ein Pronomen → Pronomen zuerst: „Ich gebe *ihn* *dem Kind*.“ / „Dimi empfiehlt *es* *ihm*.“']},
            {t:'ex', de:'Ich habe *meinem Mann* eine Uhr gekauft. → Ich habe *sie ihm* gekauft.', en:'I bought my husband a watch. → I bought it for him.'},
            {t:'p', en:'The preposition „von“ + Dative shows origin/possession: von meinem Kollegen.', de:'Die Präposition „von“ + Dativ zeigt Herkunft/Besitz: von meinem Kollegen.'}
          ]}
      ],
      quiz:[
        mc('„Ich schenke ___ Blumen.“ (meine Mutter, Dativ)',['meine Mutter','meiner Mutter','meinem Mutter','meinen Mutter'],1,'Dativ feminin → meiner Mutter.'),
        mc('Richtige Reihenfolge (2 Nomen): „Er gibt …“',['den Brief dem Chef','dem Chef den Brief','den Chef dem Brief','dem Brief den Chef'],1,'Dativ vor Akkusativ → dem Chef den Brief.'),
        fil('Pronomen zuerst: „Ich gebe ___ dir.“ (das Buch → es)','es','Akkusativ-Pronomen vor Dativ → es dir.'),
        mc('„Kannst du ___ das Foto zeigen?“ (ich, Dativ)',['mich','mir','mein','meiner'],1,'Dativ ich → mir.'),
        mc('„Das ist ein Geschenk ___ meinem Kollegen.“',['für','von','mit','zu'],1,'Herkunft → von + Dativ.'),
        fil('„Ich empfehle ___ dieses Buch.“ (du, Dativ)','dir','Dativ du → dir.'),
        mc('„Er zeigt ___.“ (es / seinem Freund) – korrekt:',['seinem Freund es','es seinem Freund','es ihm','beide: es seinem Freund / es ihm'],3,'Akkusativpronomen zuerst; beide Varianten korrekt.'),
        mc('„Wir gratulieren ___.“ (das Brautpaar, Dativ)',['das Brautpaar','dem Brautpaar','den Brautpaar','der Brautpaar'],1,'gratulieren + Dativ, neutral → dem Brautpaar.'),
        fil('„Sie kauft ___ Kindern Eis.“ (die Kinder, Dativ Plural)','den','Dativ Plural → den Kindern.'),
        mc('„Ich habe sie ___ gekauft.“ (er, Dativ-Pronomen)',['ihn','ihm','ihr','sein'],1,'Dativ er → ihm.')
      ]
    }
  ]
},

/* =====================================================================
   PHASE 2, B1.2  (Schritte plus Neu 6, Lektion 8-14)
   Note: the book photos label these Folge 1-14; grammar is the B1.2 arc.
   ===================================================================== */
{
  phase:'B1.2 · Schritte 6 (Lektion 8-14)', tone:'Der Endspurt zur Prüfung.', color:'#8B5CF6',
  modules:[
    {
      id:'b1-l8', lektion:8, title:'Glück & Vergangenheit', subtitle:'Präteritum · als · Plusquamperfekt',
      color:'#5B7FFF', icon:'🍀',
      goals:['über Vergangenes berichten (Präteritum)','„als“ für einmalige Ereignisse','Vorzeitigkeit mit Plusquamperfekt'],
      wortfelder:['Kindheit & Vergangenheit','Glück','Unfallbericht'],
      grammar:[
        { id:'praet', title:'Präteritum (regelmäßig & unregelmäßig)', en:'Simple past', de:'Das Präteritum',
          blocks:[
            {t:'p', en:'The Präteritum is the written past (stories, reports). Regular: stem + -te. Irregular: vowel change.', de:'Das Präteritum ist die geschriebene Vergangenheit (Berichte, Geschichten). Regelmäßig: Stamm + -te. Unregelmäßig: Vokalwechsel.'},
            {t:'table', head:['Infinitiv','Präteritum (er)'], rows:[['machen','mach*te*'],['arbeiten','arbeite*te*'],['gehen','g*i*ng'],['kommen','k*a*m'],['bringen','br*a*chte'],['sein','w*a*r'],['haben','h*a*tte']]},
            {t:'ex', de:'35 Jahre lang *spielte* sie Lotto. Dann *gewann* sie.', en:'For 35 years she played the lottery. Then she won.'}
          ]},
        { id:'als', title:'Konjunktion „als“', en:'„als“ = when (one time in the past)', de:'Die Konjunktion „als“',
          blocks:[
            {t:'p', en:'Use „als“ for a single event in the past (wenn = repeated/present). Verb to the end.', de:'„als“ für ein einmaliges Ereignis in der Vergangenheit (wenn = wiederholt/Gegenwart). Verb am Ende.'},
            {t:'ex', de:'*Als* ich ein Kind *war*, wohnte ich in Köln.', en:'When I was a child, I lived in Cologne.'}
          ]},
        { id:'plusquam', title:'Plusquamperfekt', en:'Past perfect (earlier than the past)', de:'Das Plusquamperfekt',
          blocks:[
            {t:'p', en:'Something that happened BEFORE another past event: hatte/war + Partizip II. Often with „nachdem“.', de:'Etwas, das VOR einem anderen Ereignis in der Vergangenheit passiert ist: hatte/war + Partizip II. Oft mit „nachdem“.'},
            {t:'ex', de:'*Nachdem* ich viel *trainiert hatte*, lief ich den Marathon.', en:'After I had trained a lot, I ran the marathon.'}
          ]}
      ],
      quiz:[
        mc('Präteritum von „gehen“ (er):',['gehte','ging','gang','gegangen'],1,'unregelmäßig → ging.'),
        mc('„___ ich klein war, hatte ich einen Hund.“',['Wenn','Als','Wann','Ob'],1,'einmalige Vergangenheit → als.'),
        fil('Präteritum von „haben“ (ich): Ich ___ keine Zeit.','hatte','haben → hatte.'),
        mc('Präteritum von „sein“ (wir):',['sind','waren','wart','waren gewesen'],1,'sein → waren.'),
        mc('Plusquamperfekt: „Nachdem er ___, ging er schlafen.“ (essen)',['gegessen hat','gegessen hatte','isst','aß'],1,'Vorzeitigkeit → hatte + Partizip.'),
        fil('Präteritum von „kommen“ (sie, Sg.): Sie ___ zu spät.','kam','kommen → kam.'),
        mc('„Immer ___ wir Kinder waren, spielten wir hier.“ – falsch? Richtig ist:',['als','wenn','wann','während'],1,'„immer wenn“ = Wiederholung → wenn.'),
        mc('Präteritum von „bringen“:',['bringte','brachte','brang','gebracht'],1,'bringen → brachte.'),
        fil('„Als das Telefon ___, schlief ich.“ (klingeln, Präteritum)','klingelte','regelmäßig → klingelte.'),
        mc('Welcher Satz ist Plusquamperfekt?',['Ich habe gegessen.','Ich hatte gegessen.','Ich esse.','Ich aß.'],1,'hatte + Partizip = Plusquamperfekt.')
      ]
    },
    {
      id:'b1-l9', lektion:9, title:'Unterhaltung', subtitle:'obwohl · Relativsätze · Gradpartikeln',
      color:'#7BC950', icon:'📺',
      goals:['Gegensätze ausdrücken (obwohl)','Personen/Dinge näher beschreiben (Relativsatz)','verstärken (echt, ziemlich)'],
      wortfelder:['Unterhaltung','Musik','Fernsehen & Serien'],
      grammar:[
        { id:'obwohl', title:'Konjunktion „obwohl“', en:'„obwohl“ = although', de:'Die Konjunktion „obwohl“',
          blocks:[
            {t:'p', en:'„obwohl“ expresses an unexpected contrast. Verb to the end.', de:'„obwohl“ drückt einen überraschenden Gegensatz aus. Verb am Ende.'},
            {t:'ex', de:'Max sieht die Serie, *obwohl* er sie schon dreimal *gesehen hat*.', en:'Max watches the series although he has already seen it three times.'}
          ]},
        { id:'relativ', title:'Relativsätze (der/das/die)', en:'Relative clauses', de:'Relativsätze',
          blocks:[
            {t:'p', en:'A relative clause describes a noun. The relative pronoun matches the noun in gender/number; its CASE depends on its role inside the relative clause. Verb to the end.', de:'Ein Relativsatz beschreibt ein Nomen. Das Relativpronomen richtet sich in Genus/Numerus nach dem Nomen; der KASUS hängt von seiner Rolle im Relativsatz ab. Verb am Ende.'},
            {t:'table', head:['','maskulin','neutral','feminin','Plural'], rows:[['Nominativ','der','das','die','die'],['Akkusativ','*den*','das','die','die'],['Dativ','*dem*','*dem*','*der*','*denen*']]},
            {t:'ex', de:'Der Mann, *der* gut kocht … / Der Mann, *den* ich kenne … / Der Job, *mit dem* er Geld verdient …', en:'The man who cooks well… / whom I know… / the job with which he earns money…'}
          ]}
      ],
      quiz:[
        mc('„Ich gehe joggen, ___ es regnet.“',['weil','obwohl','wenn','dass'],1,'Gegensatz → obwohl.'),
        mc('„Das ist der Mann, ___ nebenan wohnt.“',['der','den','dem','die'],0,'Subjekt im Relativsatz → Nominativ maskulin → der.'),
        mc('„Das ist der Film, ___ ich gestern gesehen habe.“',['der','den','dem','das'],1,'Akkusativobjekt → den.'),
        fil('„Die Frau, ___ ich helfe, ist krank.“ (helfen + Dativ, fem.)','der','Dativ feminin → der.'),
        mc('„Er kommt, ___ er krank ist.“',['weil','obwohl','deshalb','wenn'],1,'unerwartet → obwohl.'),
        mc('„Das Kind, ___ dort spielt, ist mein Sohn.“',['der','das','den','dem'],1,'Nominativ neutral → das.'),
        fil('„Die Leute, ___ ich vertraue, sind wenige.“ (vertrauen + Dativ, Plural)','denen','Dativ Plural → denen.'),
        mc('Gradpartikel – wähle die Verstärkung: „Der Film war ___ langweilig.“',['ein','ziemlich','der','sehr viel'],1,'Gradpartikel → ziemlich.'),
        mc('„Das Auto, ___ Motor kaputt ist, steht dort.“ (Genitiv, neutral)',['das','dessen','deren','dem'],1,'Genitiv neutral/maskulin → dessen.'),
        fil('„Der Job, ___ dem er zufrieden ist.“ (mit)','mit','Relativsatz mit Präposition: mit dem.')
      ]
    },
    {
      id:'b1-l10', lektion:10, title:'Gesund bleiben', subtitle:'Passiv · Genitiv',
      color:'#FF7A59', icon:'🩺',
      goals:['Vorgänge beschreiben (Passiv)','Passiv mit Modalverben','Genitiv mit Artikel'],
      wortfelder:['Gesundheit','Gesundheitsvorsorge','Untersuchung beim Arzt'],
      grammar:[
        { id:'passiv', title:'Passiv Präsens (mit/ohne Modalverb)', en:'Passive voice (present)', de:'Das Passiv im Präsens',
          blocks:[
            {t:'p', en:'The passive focuses on the action, not the doer: werden + Partizip II. With a modal: modal + Partizip II + werden.', de:'Das Passiv betont die Handlung, nicht die Person: werden + Partizip II. Mit Modalverb: Modalverb + Partizip II + werden.'},
            {t:'ex', de:'Das Rezept *wird* vom Arzt *geschrieben*.  ·  Auf Bewegung *sollte* besonders *geachtet werden*.', en:'The prescription is written by the doctor. · Movement should especially be paid attention to.'},
            {t:'table', head:['','Aktiv','Passiv'], rows:[['Präsens','Der Arzt untersucht den Patienten.','Der Patient *wird* untersucht.']]}
          ]},
        { id:'genitiv', title:'Genitiv mit Artikel', en:'Genitive with articles', de:'Der Genitiv mit Artikel',
          blocks:[
            {t:'p', en:'The genitive shows possession/relation (whose?). Masc/neuter add -s to the noun; article: des/eines (m/n), der/einer (f/pl).', de:'Der Genitiv zeigt Besitz/Zugehörigkeit (wessen?). Maskulin/Neutral: Nomen + -s; Artikel: des/eines (m/n), der/einer (f/Pl).'},
            {t:'ex', de:'zur Verbesserung *der* Fitness · der Rat *eines* Fachmanns', en:'to improve fitness · the advice of an expert'}
          ]}
      ],
      quiz:[
        mc('Passiv Präsens: „Das Haus ___ gebaut.“',['ist','wird','hat','war'],1,'Passiv → wird + Partizip.'),
        mc('„Der Brief ___ geschrieben.“ (Passiv)',['wird','werden','ist','hat'],0,'Singular → wird.'),
        fil('Aktiv „Man repariert das Auto.“ → Passiv: „Das Auto ___ repariert.“','wird','Passiv Präsens → wird.'),
        mc('Passiv mit Modalverb: „Die Regel ___ beachtet werden.“',['muss','wird','ist','hat'],0,'Modalverb + Partizip + werden → muss beachtet werden.'),
        mc('Genitiv: „der Rat ___ Arztes“',['der','des','dem','den'],1,'Genitiv maskulin → des (+ -es am Nomen).'),
        fil('Genitiv feminin: „zur Verbesserung ___ Gesundheit“','der','Genitiv feminin → der.'),
        mc('„Die Patienten ___ untersucht.“ (Passiv Plural)',['wird','werden','ist','sind'],1,'Plural → werden.'),
        mc('Wessen Buch? – Genitiv: „das Buch ___ Kindes“',['der','des','dem','den'],1,'Genitiv neutral → des Kindes.'),
        fil('Passiv: „Hier ___ nicht geraucht.“ (man raucht hier nicht)','wird','unpersönliches Passiv → wird.'),
        mc('„Das Auto ___ Mannes ist teuer.“ (Genitiv)',['der','des','dem','den'],1,'Genitiv maskulin → des Mannes.')
      ]
    },
    {
      id:'b1-l11', lektion:11, title:'Sprachen', subtitle:'Konjunktiv II irreal · wegen + Genitiv',
      color:'#F5C451', icon:'🗣️',
      goals:['Irreales / Wünsche ausdrücken','höflich absagen','Grund mit „wegen“'],
      wortfelder:['Sprachen','Mehrsprachigkeit'],
      grammar:[
        { id:'konj2', title:'Konjunktiv II – irreale Bedingung', en:'Conjunctive II, unreal conditions', de:'Konjunktiv II – irreale Bedingung',
          blocks:[
            {t:'p', en:'For hypothetical/unreal situations use würde + infinitive, or hätte/wäre/könnte. Politeness too.', de:'Für Hypothetisches/Irreales: würde + Infinitiv, oder hätte/wäre/könnte. Auch für Höflichkeit.'},
            {t:'table', head:['','haben→','sein→','werden→'], rows:[['ich','hätte','wäre','würde'],['du','hättest','wär(e)st','würdest'],['er/sie','hätte','wäre','würde']]},
            {t:'ex', de:'*Wenn* ich Zeit *hätte*, *würde* ich mehr *reisen*.  ·  An deiner Stelle *würde* ich das anders machen.', en:'If I had time, I would travel more. · In your position I would do it differently.'}
          ]},
        { id:'wegen', title:'Präposition „wegen“ + Genitiv', en:'„wegen“ + genitive (because of)', de:'Die Präposition „wegen“ + Genitiv',
          blocks:[
            {t:'ex', de:'*Wegen meines Berufs* habe ich wenig Zeit.', en:'Because of my job I have little time.'},
            {t:'tip', h:'Umgangssprache', body:'Gesprochen hört man oft „wegen“ + Dativ (wegen dem Wetter). In der Prüfung ist Genitiv sicherer.'}
          ]}
      ],
      quiz:[
        mc('„Wenn ich reich ___, würde ich ein Haus kaufen.“ (sein)',['bin','war','wäre','bins'],2,'irreal → wäre.'),
        mc('„Ich ___ gern mehr reisen.“ (würde-Form höflich/Wunsch)',['werde','würde','wurde','worden'],1,'Konjunktiv II → würde.'),
        fil('„Wenn ich Zeit ___, käme ich mit.“ (haben, Konj. II)','hätte','haben → hätte.'),
        mc('Höfliche Bitte: „___ Sie mir bitte helfen?“',['Können','Könnten','Konnten','Kann'],1,'höflich → Könnten.'),
        mc('„___ des Wetters bleiben wir zu Hause.“',['Wegen','Weil','Trotz','Während'],0,'Grund + Genitiv → Wegen.'),
        fil('„Wegen ___ Krankheit kann er nicht kommen.“ (seine, feminin → Genitiv)','seiner','Genitiv feminin → seiner.'),
        mc('„An deiner Stelle ___ ich mehr lernen.“',['werde','würde','wurde','will'],1,'Ratschlag irreal → würde.'),
        mc('„Wenn er hier ___, wäre alles besser.“ (sein)',['ist','war','wäre','sein'],2,'irreal → wäre.'),
        fil('Konjunktiv II von „können“ (ich): Ich ___ dir helfen.','könnte','können → könnte.'),
        mc('„Wegen ___ Berufs zieht sie um.“ (ihr, maskulin Genitiv)',['ihres','ihrer','ihrem','ihren'],0,'Genitiv maskulin → ihres Berufs.')
      ]
    },
    {
      id:'b1-l12', lektion:12, title:'Eine Arbeit finden', subtitle:'Infinitiv mit zu · temporale Präpositionen',
      color:'#0EA5A0', icon:'📄',
      goals:['Infinitivsätze mit „zu“ bilden','eine Bewerbung verstehen','während/außerhalb/innerhalb + Genitiv'],
      wortfelder:['Berufswünsche','Jobsuche','Bewerbung','Vorstellungsgespräch'],
      grammar:[
        { id:'inf-zu', title:'Infinitiv mit „zu“', en:'Infinitive with „zu“', de:'Der Infinitiv mit „zu“',
          blocks:[
            {t:'p', en:'After many expressions (es ist wichtig, ich habe vor, ich hoffe…) use „zu + infinitive“ at the end. Separable verbs: zu goes inside (an-zu-rufen).', de:'Nach vielen Ausdrücken (es ist wichtig, ich habe vor, ich hoffe…) folgt „zu + Infinitiv“ am Ende. Trennbare Verben: zu in die Mitte (an-zu-rufen).'},
            {t:'ex', de:'Es ist toll, Kunden *zu beraten*.  ·  Ich habe vor, morgen *anzurufen*.', en:'It’s great to advise customers. · I plan to call tomorrow.'}
          ]},
        { id:'temp-gen', title:'während / außerhalb / innerhalb + Genitiv', en:'Temporal prepositions + genitive', de:'Temporale Präpositionen + Genitiv',
          blocks:[
            {t:'ex', de:'*Während der Arbeit* darf man nicht telefonieren.  ·  Wir haben *außerhalb der Öffnungszeiten* geschlossen.', en:'During work you may not phone. · We are closed outside opening hours.'}
          ]}
      ],
      quiz:[
        mc('„Es ist wichtig, pünktlich ___.“ (sein)',['sein','zu sein','ist','sei'],1,'Infinitiv mit zu → zu sein.'),
        mc('Trennbar: „Ich habe vor, dich ___.“ (anrufen)',['zu anrufen','anzurufen','anrufen zu','zurufen an'],1,'zu in die Mitte → anzurufen.'),
        fil('„Ich hoffe, bald eine Arbeit ___.“ (finden, mit zu)','zu finden','Infinitiv mit zu → zu finden.'),
        mc('„___ der Pause essen wir.“ (Zeitraum + Genitiv)',['Während','Wegen','Trotz','Seit'],0,'Zeitraum → Während + Genitiv.'),
        mc('„Bitte rufen Sie ___ der Öffnungszeiten an.“ (innerhalb)',['innerhalb','während','wegen','außer'],0,'innerhalb + Genitiv.'),
        fil('„Es macht Spaß, mit Menschen ___.“ (arbeiten, mit zu)','zu arbeiten','zu + Infinitiv.'),
        mc('„Während ___ Woche arbeite ich.“ (die, feminin Genitiv)',['die','der','den','das'],1,'Genitiv feminin → der Woche.'),
        mc('Welcher Satz ist korrekt?',['Ich versuche lernen Deutsch.','Ich versuche, Deutsch zu lernen.','Ich versuche Deutsch lernen zu.','Ich versuche zu Deutsch lernen.'],1,'Infinitivsatz: …, Deutsch zu lernen.'),
        fil('„Ich habe keine Zeit, dir ___.“ (helfen, mit zu)','zu helfen','zu + Infinitiv.'),
        mc('„___ des Urlaubs ist das Büro zu.“ (Zeitraum)',['Während','Wegen','Ohne','Statt'],0,'Zeitraum → Während.')
      ]
    },
    {
      id:'b1-l13', lektion:13, title:'Dienstleistung', subtitle:'um…zu / damit · statt/ohne…zu · es',
      color:'#8B5CF6', icon:'🔧',
      goals:['Absicht ausdrücken (um…zu / damit)','ein Kundengespräch führen','eine Reklamation schreiben'],
      wortfelder:['Dienstleistungen','Reklamieren','Arbeitsalltag'],
      grammar:[
        { id:'um-zu', title:'„um … zu“ und „damit“ (Ziel/Absicht)', en:'„um…zu“ / „damit“ = in order to', de:'„um … zu“ und „damit“',
          blocks:[
            {t:'p', en:'Both express purpose. „um…zu“ when both clauses share the same subject; „damit“ when subjects differ.', de:'Beide drücken ein Ziel aus. „um…zu“ bei gleichem Subjekt; „damit“ bei verschiedenen Subjekten.'},
            {t:'ex', de:'Leon steht früh auf, *um* pünktlich zu sein.  ·  Ich erkläre es, *damit* du es verstehst.', en:'Leon gets up early (in order) to be on time. · I explain it so that you understand it.'}
          ]},
        { id:'statt-ohne', title:'„statt … zu“ und „ohne … zu“', en:'„statt…zu“ (instead of) / „ohne…zu“ (without)', de:'„statt … zu“ und „ohne … zu“',
          blocks:[
            {t:'ex', de:'Man sollte etwas tun, *statt* nur zu träumen.  ·  Er ging, *ohne* etwas zu sagen.', en:'One should do something instead of only dreaming. · He left without saying anything.'}
          ]}
      ],
      quiz:[
        mc('„Ich lerne, ___ die Prüfung zu bestehen.“',['damit','um','weil','ohne'],1,'gleiches Subjekt, Ziel → um…zu.'),
        mc('„Ich spreche laut, ___ mich alle verstehen.“',['um','damit','ohne','statt'],1,'verschiedene Subjekte → damit.'),
        fil('„Er geht zum Arzt, ___ gesund zu werden.“','um','Ziel, gleiches Subjekt → um.'),
        mc('„Sie ging weg, ___ etwas zu sagen.“',['um','damit','ohne','statt'],2,'ohne … zu = ohne etwas zu sagen.'),
        mc('„___ zu arbeiten, schläft er den ganzen Tag.“',['Um','Damit','Statt','Ohne'],2,'statt … zu = anstatt.'),
        fil('„Ich rufe an, ___ einen Termin zu machen.“','um','Ziel → um…zu.'),
        mc('Welcher Satz braucht „damit“?',['Ich lerne, ___ gute Noten zu bekommen.','Ich gebe dir Geld, ___ du einkaufen kannst.','Sie kommt früher, ___ pünktlich zu sein.','Er trainiert, ___ fit zu bleiben.'],1,'verschiedene Subjekte (ich/du) → damit.'),
        mc('„Es gibt heute keinen Kaffee.“ – „es“ ist hier …',['Subjekt (unpersönlich)','Objekt','Reflexivpronomen','ein Fehler'],0,'„es gibt“ – festes unpersönliches „es“.'),
        fil('„Er arbeitet viel, ___ Geld zu verdienen.“','um','Ziel gleiches Subjekt → um.'),
        mc('„Man sollte handeln, ___ nur zu reden.“',['um','damit','statt','ohne'],2,'statt … zu.')
      ]
    },
    {
      id:'b1-l14', lektion:14, title:'Rund ums Wohnen & Rückblick', subtitle:'zweiteilige Konjunktionen · Konjunktiv II Vergangenheit · trotz',
      color:'#EC4899', icon:'🏘️',
      goals:['Konflikte höflich lösen','zweiteilige Konjunktionen','irreale Wünsche der Vergangenheit'],
      wortfelder:['Zusammenleben & Regeln','Wohnsituationen','Nachbarschaft'],
      grammar:[
        { id:'zweiteilig', title:'Zweiteilige Konjunktionen', en:'Two-part conjunctions', de:'Zweiteilige Konjunktionen',
          blocks:[
            {t:'table', head:['Konjunktion','Bedeutung','Beispiel'], rows:[['sowohl … als auch','both … and','*sowohl* lecker *als auch* gesund'],['weder … noch','neither … nor','*weder* lecker *noch* gesund'],['entweder … oder','either … or','*entweder* heute *oder* morgen'],['nicht nur … sondern auch','not only … but also','*nicht nur* Lärm, *sondern auch* Schmutz'],['zwar … aber','admittedly … but','*zwar* teuer, *aber* schön']]}
          ]},
        { id:'konj2-verg', title:'Konjunktiv II der Vergangenheit', en:'Conjunctive II past (unreal wishes about the past)', de:'Konjunktiv II der Vergangenheit',
          blocks:[
            {t:'p', en:'For regrets about the past: hätte/wäre + Partizip II. „Hätte ich bloß …!“ = If only I had…!', de:'Für Bedauern über die Vergangenheit: hätte/wäre + Partizip II. „Hätte ich bloß …!“'},
            {t:'ex', de:'*Hätte* ich bloß nichts *gesagt*!  ·  Wenn ich mehr *gelernt hätte*, *wäre* ich nicht durchgefallen.', en:'If only I hadn’t said anything! · If I had studied more, I wouldn’t have failed.'}
          ]},
        { id:'trotz', title:'Präposition „trotz“ + Genitiv', en:'„trotz“ + genitive (despite)', de:'„trotz“ + Genitiv',
          blocks:[
            {t:'ex', de:'*Trotz des Lärms* konnte ich schlafen.', en:'Despite the noise I could sleep.'}
          ]}
      ],
      quiz:[
        mc('„Das Essen ist ___ lecker ___ gesund.“',['weder … noch','sowohl … als auch','entweder … oder','zwar … aber'],1,'both … and → sowohl … als auch.'),
        mc('„Ich mag ___ Kaffee ___ Tee. Ich trinke nur Wasser.“',['sowohl … als auch','weder … noch','nicht nur … sondern','entweder … oder'],1,'neither … nor → weder … noch.'),
        fil('„___ des Regens gingen wir spazieren.“ (despite + Genitiv)','Trotz','trotz + Genitiv.'),
        mc('„Hätte ich das ___!“ (wissen, Konj. II Verg.)',['weiß','gewusst','wusste','wissen'],1,'hätte + Partizip → gewusst.'),
        mc('„Wenn ich mehr gelernt ___, hätte ich bestanden.“',['habe','hatte','hätte','würde'],2,'irreal Vergangenheit → hätte.'),
        fil('„Es war ___ nur laut, ___ auch schmutzig.“ (not only … but also)','nicht nur','„nicht nur … sondern auch“.'),
        mc('„Wir fahren ___ nach Berlin ___ nach Hamburg.“ (Wahl)',['weder … noch','entweder … oder','sowohl … als auch','zwar … aber'],1,'Wahl → entweder … oder.'),
        mc('„Wäre ich früher ___, hätte ich den Zug erreicht.“ (gehen)',['gegangen','geganen','gehen','ging'],0,'wäre + Partizip → gegangen.'),
        fil('„Trotz ___ Wetters (das) gingen wir raus.“ (Genitiv neutral)','des','Genitiv neutral → des Wetters.'),
        mc('„Die Wohnung ist ___ klein, ___ gemütlich.“',['weder … noch','zwar … aber','entweder … oder','sowohl'],1,'Einräumung + Gegensatz → zwar … aber.')
      ]
    }
  ]
}
];

/* =====================================================================
   DTZ / telc B1 exam skills, the four graded parts + phonetics
   ===================================================================== */
export const EXAM_INFO = {
  title:'Deutsch-Test für Zuwanderer (DTZ), B1',
  intro_en:'The DTZ is a scaled exam: your result can be A2 or B1 depending on your score. It has a written part (~100 min) and an oral part (~15 min, in pairs). You need roughly 60% to reach B1 in each part.',
  intro_de:'Der DTZ ist eine skalierte Prüfung: Ihr Ergebnis kann A2 oder B1 sein – je nach Punktzahl. Es gibt einen schriftlichen Teil (~100 Min.) und einen mündlichen Teil (~15 Min., zu zweit). Für B1 brauchen Sie etwa 60% pro Teil.',
  parts:[
    { k:'Hören', points:'~45 min', desc:'4 parts: announcements/messages, radio, conversations, opinions.' },
    { k:'Lesen', points:'~45 min', desc:'5 parts: matching ads, info texts, official letters, signs.' },
    { k:'Schreiben', points:'~30 min', desc:'A semi-formal letter/email about an everyday situation.' },
    { k:'Sprechen', points:'~15 min', desc:'Part 1: introduce yourself. Part 2: talk about a picture/experience. Part 3: plan something together.' }
  ]
};

export const SKILLS = {
  Hören: {
    icon:'🎧', color:'#5B7FFF',
    lead_en:'Train your ear with the built-in German voice, then answer. Free listening: DW „Nicos Weg“ (B1), the tagesschau in Easy German, and telc B1 sample audio.',
    lead_de:'Trainiere dein Ohr mit der eingebauten deutschen Stimme und antworte dann. Kostenlos: DW „Nicos Weg“ (B1), langsam gesprochene Nachrichten und telc-B1-Modellaudio.',
    tasks:[
      { id:'h1', title:'Ansage: Arzttermin', level:'B1',
        script:'Guten Tag, hier ist die Praxis Dr. Weber. Ihr Termin am Montag um 15 Uhr muss leider verschoben werden. Bitte rufen Sie uns zurück, um einen neuen Termin zu vereinbaren. Vielen Dank.',
        q:{ type:'mc', q:'Warum ruft die Praxis an?', options:['Der Termin fällt aus / wird verschoben.','Die Rechnung ist offen.','Das Medikament ist da.'], answer:0, explain:'„…muss verschoben werden.“ = der Termin ändert sich.' } },
      { id:'h2', title:'Durchsage: Bahnhof', level:'B1',
        script:'Achtung an Gleis drei: Der Regionalzug nach München hat heute etwa zwanzig Minuten Verspätung. Wir bitten um Ihr Verständnis.',
        q:{ type:'mc', q:'Was ist das Problem?', options:['Der Zug fällt aus.','Der Zug hat 20 Minuten Verspätung.','Das Gleis ist geändert.'], answer:1, explain:'„…zwanzig Minuten Verspätung.“' } },
      { id:'h3', title:'Nachricht: Einladung', level:'B1',
        script:'Hallo Maria, hier ist Julia. Ich mache am Samstag eine kleine Feier bei mir zu Hause. Es wäre schön, wenn du kommen könntest. Bring gern etwas zu trinken mit. Bis dann!',
        q:{ type:'mc', q:'Was soll Maria mitbringen?', options:['einen Kuchen','etwas zu trinken','nichts'], answer:1, explain:'„Bring gern etwas zu trinken mit.“' } }
    ]
  },
  Lesen: {
    icon:'📖', color:'#22B981',
    lead_en:'Read a short authentic-style text and answer. Tip: read the questions first, then scan for the answer.',
    lead_de:'Lies einen kurzen Text und antworte. Tipp: zuerst die Fragen lesen, dann den Text überfliegen.',
    tasks:[
      { id:'l1', title:'Aushang im Mietshaus', level:'B1',
        text:'Liebe Hausbewohner, wegen Wartungsarbeiten wird am Mittwoch, den 12. Juni, von 9 bis 13 Uhr das Wasser abgestellt. Bitte bevorraten Sie sich rechtzeitig mit Trinkwasser. Der Aufzug funktioniert an diesem Tag normal. Ihre Hausverwaltung.',
        q:{ type:'mc', q:'Was passiert am 12. Juni?', options:['Der Aufzug fällt aus.','Es gibt kein Wasser von 9 bis 13 Uhr.','Es gibt eine Feier.'], answer:1, explain:'„…wird das Wasser abgestellt.“ Der Aufzug funktioniert normal.' } },
      { id:'l2', title:'E-Mail vom Amt', level:'B1',
        text:'Sehr geehrte Frau Kaya, Ihr Antrag ist bei uns eingegangen. Leider fehlt noch eine Kopie Ihres Mietvertrags. Bitte reichen Sie diese bis zum 30. des Monats nach, sonst können wir Ihren Antrag nicht bearbeiten. Mit freundlichen Grüßen, Ihr Bürgeramt.',
        q:{ type:'mc', q:'Was muss Frau Kaya tun?', options:['Nichts, alles ist fertig.','Eine Kopie des Mietvertrags nachreichen.','Persönlich vorbeikommen.'], answer:1, explain:'„…fehlt noch eine Kopie Ihres Mietvertrags. Bitte reichen Sie diese nach.“' } }
    ]
  },
  Schreiben: {
    icon:'✍️', color:'#FF7A59',
    lead_en:'DTZ writing = a half-formal letter. You get 4 bullet points and must cover ALL of them. Structure: greeting → reason for writing → the 4 points → closing. ~30 min.',
    lead_de:'DTZ-Schreiben = ein halbformeller Brief. Du bekommst 4 Punkte und musst ALLE bearbeiten. Aufbau: Anrede → Grund → die 4 Punkte → Gruß. ~30 Min.',
    phrases:{
      title:'Useful building blocks',
      groups:[
        { h:'Greeting', items:['Sehr geehrte Damen und Herren,','Liebe/r … , (informell)'] },
        { h:'Opening', items:['ich schreibe Ihnen, weil …','vielen Dank für Ihre E-Mail.','ich habe ein Problem mit …'] },
        { h:'Request / suggestion', items:['Könnten Sie mir bitte …?','Ich würde vorschlagen, dass …','Wäre es möglich, … ?'] },
        { h:'Sign-off', items:['Mit freundlichen Grüßen','Viele Grüße (informell)'] }
      ]
    },
    tasks:[
      { id:'w1', title:'Entschuldigung beim Deutschkurs', level:'B1',
        prompt_de:'Sie können nächste Woche nicht zum Deutschkurs kommen. Schreiben Sie eine E-Mail an Ihre Lehrerin, Frau Schmidt.',
        points:['Warum schreiben Sie?','Grund für Ihr Fehlen','Fragen Sie nach den Hausaufgaben','Bedanken Sie sich'],
        model:'Sehr geehrte Frau Schmidt,\n\nich schreibe Ihnen, weil ich nächste Woche leider nicht zum Deutschkurs kommen kann. Der Grund ist, dass ich einen wichtigen Arzttermin habe.\n\nKönnten Sie mir bitte sagen, welche Hausaufgaben wir machen sollen? Ich möchte den Stoff gern zu Hause nachholen.\n\nVielen Dank für Ihre Hilfe.\n\nMit freundlichen Grüßen\n…' },
      { id:'w2', title:'Reklamation: kaputtes Gerät', level:'B1',
        prompt_de:'Sie haben online eine Kaffeemaschine gekauft, aber sie funktioniert nicht. Schreiben Sie an den Kundenservice.',
        points:['Grund für Ihr Schreiben','Was ist das Problem?','Was möchten Sie? (Reparatur/Geld zurück)','Bitten Sie um eine schnelle Antwort'],
        model:'Sehr geehrte Damen und Herren,\n\nich habe am 3. Mai bei Ihnen eine Kaffeemaschine bestellt. Leider funktioniert das Gerät nicht: Es lässt sich nicht einschalten.\n\nIch möchte Sie bitten, mir die Maschine zu reparieren oder mir mein Geld zurückzuerstatten.\n\nBitte antworten Sie mir so schnell wie möglich.\n\nMit freundlichen Grüßen\n…' }
    ]
  },
  Sprechen: {
    icon:'🎙️', color:'#8B5CF6',
    lead_en:'The oral exam has 3 parts. Practice out loud, the mic below listens (best in Chrome) and shows what it heard so you can compare. Speaking = 50% of your grade, so talk every day, even to yourself!',
    lead_de:'Der mündliche Teil hat 3 Aufgaben. Üben Sie laut, das Mikro unten hört zu (am besten in Chrome) und zeigt, was es verstanden hat. Sprechen = 50% der Note, also reden Sie jeden Tag, auch mit sich selbst!',
    tasks:[
      { id:'s1', title:'Teil 1 – Sich vorstellen', level:'B1',
        prompt_de:'Stellen Sie sich vor: Name, Herkunft, Familie, Beruf, Hobbys, warum Sie Deutsch lernen.',
        starters:['Ich heiße … und komme aus …','Ich lebe seit … Jahren in Deutschland.','Ich lerne Deutsch, weil …','In meiner Freizeit … gern.'] },
      { id:'s2', title:'Teil 2 – Über ein Bild / Erfahrung sprechen', level:'B1',
        prompt_de:'Thema: „Feste feiern“. Erzählen Sie über ein Fest in Ihrem Heimatland: Was feiert man? Wie? Mit wem?',
        starters:['Auf dem Bild sehe ich …','In meinem Heimatland feiern wir …','Das Fest bedeutet für mich …','Man isst dabei typischerweise …'] },
      { id:'s3', title:'Teil 3 – Gemeinsam etwas planen', level:'B1',
        prompt_de:'Planen Sie mit Ihrem Partner ein Abschiedsfest für den Deutschkurs: Wann? Wo? Was mitbringen? Wen einladen?',
        starters:['Ich schlage vor, dass wir …','Wäre es besser, wenn …?','Einverstanden, aber …','Können wir uns auf … einigen?'] }
    ]
  }
};

/* Phonetik quick-reference pulled from the Arbeitsbuch pages */
export const PHONETIK = [
  ['Satzmelodie','Aussagen fallen (↓), Ja/Nein-Fragen steigen (↑).'],
  ['ich- und ach-Laut','„ich, Milch“ (weich) vs. „ach, Buch“ (hart).'],
  ['Umlaute ä ö ü','Mund runden für ö/ü: schön, für, Bücher.'],
  ['Wortakzent','Bei internationalen Wörtern oft hinten: Stu*dent*, Infor*mat*ion.'],
  ['ng-Laut','„singen, Zeitung“ – ohne hörbares g.'],
  ['Auslautverhärtung','b/d/g am Wortende klingen wie p/t/k: Tag → „Tak“.'],
  ['ch nach Konsonant','„Milch, durch“ – weicher ich-Laut.']
];

/* =====================================================================
   VOCABULARY DECKS (flashcards). Each deck links to a lesson via moduleId.
   Card: { de: German (with article/plural), en: English, ex?: example }
   ===================================================================== */
export const VOCAB = [
  { id:'voc-a2-verben', moduleId:'a2-verben', title:'Alltag: Tagesablauf', cards:[
    {de:'aufstehen', en:'to get up', ex:'Ich stehe um 6 Uhr auf.'},
    {de:'frühstücken', en:'to have breakfast'},
    {de:'sich anziehen', en:'to get dressed'},
    {de:'einkaufen', en:'to go shopping'},
    {de:'kochen', en:'to cook'},
    {de:'aufräumen', en:'to tidy up'},
    {de:'sich ausruhen', en:'to rest'},
    {de:'einschlafen', en:'to fall asleep'},
    {de:'spazieren gehen', en:'to go for a walk'},
    {de:'sich treffen (mit)', en:'to meet (with)'}
  ]},
  { id:'voc-a2-kasus', moduleId:'a2-kasus', title:'Wohnung & Gegenstände', cards:[
    {de:'der Tisch, -e', en:'table'},
    {de:'der Stuhl, ¨-e', en:'chair'},
    {de:'das Fenster, -', en:'window'},
    {de:'die Tür, -en', en:'door'},
    {de:'der Schrank, ¨-e', en:'cupboard / wardrobe'},
    {de:'das Regal, -e', en:'shelf'},
    {de:'die Lampe, -n', en:'lamp'},
    {de:'das Bett, -en', en:'bed'},
    {de:'der Teppich, -e', en:'carpet'},
    {de:'die Küche, -n', en:'kitchen'}
  ]},
  { id:'voc-a2-perfekt', moduleId:'a2-perfekt', title:'Reise & Erlebnisse', cards:[
    {de:'die Reise, -n', en:'trip, journey'},
    {de:'der Ausflug, ¨-e', en:'excursion'},
    {de:'das Erlebnis, -se', en:'experience'},
    {de:'der Koffer, -', en:'suitcase'},
    {de:'die Fahrkarte, -n', en:'ticket'},
    {de:'der Bahnhof, ¨-e', en:'train station'},
    {de:'die Unterkunft, ¨-e', en:'accommodation'},
    {de:'besichtigen', en:'to visit, to sightsee'},
    {de:'sich erholen', en:'to recover, to relax'},
    {de:'die Erinnerung, -en', en:'memory'}
  ]},
  { id:'voc-l1', moduleId:'b1-l1', title:'Ankommen: Familie & Wohnformen', cards:[
    {de:'der/die Verwandte, -n', en:'relative'},
    {de:'der Neffe, -n', en:'nephew'},
    {de:'die Nichte, -n', en:'niece'},
    {de:'die Schwiegermutter, ¨-', en:'mother-in-law'},
    {de:'der Enkel, -', en:'grandson'},
    {de:'alleinerziehend', en:'single-parent (raising alone)'},
    {de:'die Wohngemeinschaft (WG), -en', en:'shared flat'},
    {de:'das Reihenhaus, ¨-er', en:'terraced house'},
    {de:'die Umgebung, -en', en:'surroundings'},
    {de:'sich kümmern um', en:'to take care of'}
  ]},
  { id:'voc-l2', moduleId:'b1-l2', title:'Zu Hause: Miete & Mietshaus', cards:[
    {de:'die Miete, -n', en:'rent'},
    {de:'der Vermieter, -', en:'landlord'},
    {de:'der Mieter, -', en:'tenant'},
    {de:'die Nebenkosten (Pl.)', en:'utility costs'},
    {de:'die Kaution, -en', en:'deposit'},
    {de:'der Aufzug, ¨-e', en:'elevator'},
    {de:'der Hausflur, -e', en:'hallway'},
    {de:'die Hausordnung, -en', en:'house rules'},
    {de:'der Nachbar, -n', en:'neighbour'},
    {de:'umziehen', en:'to move (house)'}
  ]},
  { id:'voc-l3', moduleId:'b1-l3', title:'Essen: Geschirr & Restaurant', cards:[
    {de:'der Teller, -', en:'plate'},
    {de:'die Gabel, -n', en:'fork'},
    {de:'das Messer, -', en:'knife'},
    {de:'der Löffel, -', en:'spoon'},
    {de:'die Serviette, -n', en:'napkin'},
    {de:'die Vorspeise, -n', en:'starter'},
    {de:'die Hauptspeise, -n', en:'main course'},
    {de:'die Nachspeise, -n', en:'dessert'},
    {de:'die Rechnung, -en', en:'bill'},
    {de:'das Trinkgeld, -er', en:'tip'}
  ]},
  { id:'voc-l4', moduleId:'b1-l4', title:'Arbeitswelt', cards:[
    {de:'der Betrieb, -e', en:'company, business'},
    {de:'die Abteilung, -en', en:'department'},
    {de:'der Kollege, -n', en:'colleague'},
    {de:'die Schicht, -en', en:'shift'},
    {de:'die Überstunde, -n', en:'overtime hour'},
    {de:'die Besprechung, -en', en:'meeting'},
    {de:'der Termin, -e', en:'appointment'},
    {de:'kündigen', en:'to resign, to terminate'},
    {de:'die Bewerbung, -en', en:'application'},
    {de:'der Lohn, ¨-e', en:'wage'}
  ]},
  { id:'voc-l5', moduleId:'b1-l5', title:'Sport & Gesundheit', cards:[
    {de:'sich bewegen', en:'to move, to exercise'},
    {de:'die Bewegung, -en', en:'movement'},
    {de:'trainieren', en:'to train'},
    {de:'der Verein, -e', en:'club'},
    {de:'die Mannschaft, -en', en:'team'},
    {de:'die Verletzung, -en', en:'injury'},
    {de:'sich verletzen', en:'to injure oneself'},
    {de:'die Ausdauer (Sg.)', en:'stamina'},
    {de:'gesund', en:'healthy'},
    {de:'ungesund', en:'unhealthy'}
  ]},
  { id:'voc-l6', moduleId:'b1-l6', title:'Schule & Ausbildung', cards:[
    {de:'der Abschluss, ¨-e', en:'degree, qualification'},
    {de:'die Ausbildung, -en', en:'vocational training'},
    {de:'das Zeugnis, -se', en:'certificate, report card'},
    {de:'die Note, -n', en:'grade, mark'},
    {de:'das Fach, ¨-er', en:'(school) subject'},
    {de:'der Azubi, -s', en:'apprentice, trainee'},
    {de:'das Praktikum, Praktika', en:'internship'},
    {de:'die Hochschule, -n', en:'university, college'},
    {de:'bestehen', en:'to pass (an exam)'},
    {de:'durchfallen', en:'to fail (an exam)'}
  ]},
  { id:'voc-l7', moduleId:'b1-l7', title:'Feste & Geschenke', cards:[
    {de:'das Fest, -e', en:'celebration, festival'},
    {de:'die Hochzeit, -en', en:'wedding'},
    {de:'das Geschenk, -e', en:'gift'},
    {de:'gratulieren', en:'to congratulate'},
    {de:'einladen', en:'to invite'},
    {de:'die Einladung, -en', en:'invitation'},
    {de:'feiern', en:'to celebrate'},
    {de:'das Brautpaar, -e', en:'bridal couple'},
    {de:'die Kerze, -n', en:'candle'},
    {de:'sich freuen über', en:'to be glad about'}
  ]},
  { id:'voc-l8', moduleId:'b1-l8', title:'Glück & Vergangenheit', cards:[
    {de:'das Glück (Sg.)', en:'luck, happiness'},
    {de:'der Zufall, ¨-e', en:'coincidence'},
    {de:'der Unfall, ¨-e', en:'accident'},
    {de:'das Ereignis, -se', en:'event'},
    {de:'die Erinnerung, -en', en:'memory'},
    {de:'gewinnen', en:'to win'},
    {de:'verlieren', en:'to lose'},
    {de:'das Pech (Sg.)', en:'bad luck'},
    {de:'verletzt', en:'injured'},
    {de:'sich erinnern an', en:'to remember'}
  ]},
  { id:'voc-l9', moduleId:'b1-l9', title:'Unterhaltung', cards:[
    {de:'die Sendung, -en', en:'(TV) show, programme'},
    {de:'die Serie, -n', en:'series'},
    {de:'der Zuschauer, -', en:'viewer'},
    {de:'die Werbung, -en', en:'advertising'},
    {de:'die Folge, -n', en:'episode'},
    {de:'spannend', en:'exciting'},
    {de:'langweilig', en:'boring'},
    {de:'die Nachrichten (Pl.)', en:'the news'},
    {de:'unterhaltsam', en:'entertaining'},
    {de:'das Publikum (Sg.)', en:'audience'}
  ]},
  { id:'voc-l10', moduleId:'b1-l10', title:'Gesund bleiben', cards:[
    {de:'die Vorsorge (Sg.)', en:'check-up, prevention'},
    {de:'die Untersuchung, -en', en:'examination'},
    {de:'die Behandlung, -en', en:'treatment'},
    {de:'das Rezept, -e', en:'prescription, recipe'},
    {de:'die Beschwerden (Pl.)', en:'complaints, symptoms'},
    {de:'sich krankmelden', en:'to call in sick'},
    {de:'die Krankmeldung, -en', en:'sick note'},
    {de:'heilen', en:'to heal'},
    {de:'die Apotheke, -n', en:'pharmacy'},
    {de:'der Termin, -e', en:'appointment'}
  ]},
  { id:'voc-l11', moduleId:'b1-l11', title:'Sprachen', cards:[
    {de:'die Muttersprache, -n', en:'native language'},
    {de:'die Fremdsprache, -n', en:'foreign language'},
    {de:'mehrsprachig', en:'multilingual'},
    {de:'die Aussprache (Sg.)', en:'pronunciation'},
    {de:'der Akzent, -e', en:'accent'},
    {de:'übersetzen', en:'to translate'},
    {de:'der Ausdruck, ¨-e', en:'expression'},
    {de:'die Redewendung, -en', en:'idiom'},
    {de:'fließend', en:'fluent'},
    {de:'sich verständigen', en:'to make oneself understood'}
  ]},
  { id:'voc-l12', moduleId:'b1-l12', title:'Eine Arbeit finden', cards:[
    {de:'die Stelle, -n', en:'job, position'},
    {de:'die Anzeige, -n', en:'advertisement'},
    {de:'der Lebenslauf, ¨-e', en:'CV, résumé'},
    {de:'das Anschreiben, -', en:'cover letter'},
    {de:'das Vorstellungsgespräch, -e', en:'job interview'},
    {de:'die Qualifikation, -en', en:'qualification'},
    {de:'die Erfahrung, -en', en:'experience'},
    {de:'sich bewerben um', en:'to apply for'},
    {de:'einstellen', en:'to hire'},
    {de:'der Arbeitgeber, -', en:'employer'}
  ]},
  { id:'voc-l13', moduleId:'b1-l13', title:'Dienstleistung', cards:[
    {de:'der Kunde, -n', en:'customer'},
    {de:'die Reklamation, -en', en:'complaint'},
    {de:'die Reparatur, -en', en:'repair'},
    {de:'umtauschen', en:'to exchange'},
    {de:'die Garantie, -n', en:'guarantee, warranty'},
    {de:'die Lieferung, -en', en:'delivery'},
    {de:'sich beschweren über', en:'to complain about'},
    {de:'die Rechnung, -en', en:'invoice'},
    {de:'der Auftrag, ¨-e', en:'order, task'},
    {de:'zufrieden', en:'satisfied'}
  ]},
  { id:'voc-l14', moduleId:'b1-l14', title:'Rund ums Wohnen', cards:[
    {de:'der Streit, -e', en:'argument, dispute'},
    {de:'die Regel, -n', en:'rule'},
    {de:'der Lärm (Sg.)', en:'noise'},
    {de:'der Müll (Sg.)', en:'rubbish, trash'},
    {de:'sich einigen', en:'to reach an agreement'},
    {de:'der Kompromiss, -e', en:'compromise'},
    {de:'die Nachbarschaft, -en', en:'neighbourhood'},
    {de:'der Umzug, ¨-e', en:'move, relocation'},
    {de:'rücksichtsvoll', en:'considerate'},
    {de:'der Fortschritt, -e', en:'progress'}
  ]}
];

/* =====================================================================
   ACHIEVEMENTS (badges). Unlock logic lives in app.js (needs progress).
   ===================================================================== */
export const ACHIEVEMENTS = [
  { id:'first_step', icon:'👣', title:'First step',      desc:'Open your first chapter.' },
  { id:'first_pass', icon:'✅', title:'Passed!',         desc:'Pass your first quiz.' },
  { id:'perfect',    icon:'💯', title:'Perfect',         desc:'Score 100% on a quiz.' },
  { id:'words25',    icon:'📚', title:'25 words',        desc:'Learn 25 vocabulary words.' },
  { id:'words100',   icon:'🧠', title:'100 words',       desc:'Learn 100 vocabulary words.' },
  { id:'deck_done',  icon:'🃏', title:'Deck cleared',    desc:'Learn a whole vocabulary deck.' },
  { id:'streak3',    icon:'🔥', title:'Three in a row',  desc:'Study 3 days in a row.' },
  { id:'streak7',    icon:'⚡', title:'A full week',     desc:'Study 7 days in a row.' },
  { id:'speaker',    icon:'🎙️', title:'Spoke out loud',  desc:'Use the speaking practice.' },
  { id:'writer',     icon:'✍️', title:'First letter',    desc:'Save a writing draft.' },
  { id:'a2done',     icon:'🌱', title:'A2 refreshed',    desc:'Pass all A2 chapters.' },
  { id:'b11done',    icon:'🚀', title:'B1.1 mastered',   desc:'Pass every chapter of Schritte 5.' },
  { id:'half',       icon:'⛰️', title:'Halfway up',      desc:'Complete 50% of the course.' },
  { id:'graduate',   icon:'🏆', title:'Exam-ready',      desc:'Pass every chapter!' }
];
