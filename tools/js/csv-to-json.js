const parseOpts = {
  header: true,
  dynamicTyping: true
};

const stores = {
  units: {
    filename: `../data/csv/units.csv`
  },
  parts: {
    filename:`../data/csv/parts.csv`
  },
  pilots: {
    filename: `../data/csv/pilots.csv`
  },
  skills: {
    filename: `../data/csv/skills.csv`
  }
};

const onReady = () => {
  populateData('#pilots', stores.pilots, {
    transformer: transformPilotData,
    sorter: (a, b) => a.name.localeCompare(b.name),
    format: true
  });
  populateData('#gunpla', stores.units, {
    transformer: transformUnitData,
    process: processUnitData,
    //filter: (record) => record['Issue'],
    sorter: (a, b) => a.name.localeCompare(b.name),
    format: true
  });
}

const processUnitData = (units) => units.map(unit => {
  if (unit['Name'].startsWith('ν')) {
    unit['Name'] = unit['Name'].replace('ν', 'Nu');
  }
  return unit;
});

const transformPilotData = (record) => {
  return {
    "name": record['Name'],
    "jl": findByIndex(JobLicenseIndex, record['Job Lic']),
    "attribute": findByIndex(AttributeIndex, record['Attr']),
    "rarity": record['Rarity'],
    "a": record['Armor'],
    "ma": record['Melee ATK'],
    "sa": record['Shot ATK'],
    "md": record['Melee DEF'],
    "sd": record['Shot DEF'],
    "br": record['Beam RES'],
    "pr": record['Phys. RES'],
    "wt": [record['W Tag 1'], record['W Tag 2']].map(tagId => findByIndex(WordTagIndex, tagId)),
    "ex": {
      "type": "Part Traits",
      "name": record['Trait']
    }
  };
};

const transformUnitData = (unit) => {
  let resultUnit = {
    "name": unit['Name'] + (unit['Subname'] ? ` [${unit['Subname']}]` : ''),
    "attribute": findByIndex(AttributeIndex, unit['Attr']),
    "rarity": unit['Rarity'],
    "sokai": unit['Sokai'] ? 1 : 0,
    "parts": stores.parts.data
        .filter(part => part['Unit ID'] === unit['Index'])
        .map(part => {
          let exSkill = stores.skills.data.find(skill => skill['Index'] === part['EX ID']);
          let result = {
            "part": findByIndex(PartTypeIndex, part['Part Type']),
            "mark" : unit['Marks'],
            "a": part['Armor'],
            "ma": part['Melee ATK'],
            "sa": part['Shot ATK'],
            "md": part['Melee DEF'],
            "sd": part['Shot DEF'],
            "br": part['Beam RES'],
            "pr": part['Phys. RES'],
            "wt": [part['W Tag 1'], part['W Tag 2']].map(tagId => findByIndex(WordTagIndex, tagId)),
            "ex": {
              "type": part['Trait'] ? "Part Traits" : "EX Skill",
              "name": part['Trait']
            }
          };

          if (exSkill != null) {
            Object.assign(result.ex, {
              "name": exSkill['Name'],
              "description": exSkill['Description'],
              "category": ExCategoryIndex[exSkill['Cat'] - 1]
            })
          }

          if (part['X Part']) {
            result.combo = findByIndex(PartTypeIndex, part['X Part']);
          }

          if (part['Part Type'] > 5) {
            result.name = part['Part Name'];

            if (part['Part Type'] !== 8) {
              result.type = findByIndex(WeaponTypeIndex, part['Wep Type'])
              result.category = findByIndex(WeaponCategoryIndex, part['Wep Cat'])
            }
          }
          return result;
        })
  };

  /**
   switch (unit['Name']) {
    case 'Gundam Artemis':
    case 'Code ϕ':
      resultUnit.specialRarity = 4;
      break;
  }
   */

  return resultUnit;
};

main();