document.querySelector("form").onsubmit = async (e) => {
  e.preventDefault();

  const searchInput = document.querySelector("#search").value;
  const imgEl = document.querySelector(".imgResult");
  const jsonEl = document.querySelector(".jsonResult");

  try {
    imgEl.setAttribute("alt", "Loading...");

    const jsonResults = await fetch(`/v1/name/${searchInput}`).then((res) =>
      res.json()
    );

    console.log(searchInput);

    jsonEl.innerHTML = `<pre>${JSON.stringify(
      jsonResults,
      undefined,
      2
    )}</pre>`;

    const options = {
      "headers": {
        "X-Requested-With": "XMLHttpRequest"
      }
    }

    const mobData = await fetch(`https://hopollocors.herokuapp.com/https://solomonk.fr/ajax/select_monster.php?lang=fr&Q=10&O=0&T=all&I=${jsonResults.id}&CS%5BbestiaryCollapseSpells%5D=true&CS%5BbestiaryCollapseSubareas%5D=true&CS%5BbestiaryCollapseDrops%5D=true&CS%5BbestiaryCollapseDropsTemporis%5D=true`, options).then(res => res.json());
    console.log(mobData);

    const img = JSON.stringify(mobData.html).split('https://solomonk.fr/img/monsters/artworks/')[1].split('.svg')[0];

    imgEl.setAttribute("alt", jsonResults.name);
    imgEl.setAttribute(
      "src",
      `https://solomonk.fr/img/monsters/artworks/${img}`
    );
  } catch (e) {
    console.error(e);
  }
};
