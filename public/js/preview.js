document.querySelector('#search').onchange = async () => {
  const searchInput = document.querySelector('#search').value;
  const imgEl = document.querySelector('.imgResult');
  const jsonEl = document.querySelector('.jsonResult');

  const jsonResults = await fetch(`/v1/name/${searchInput}`).then(res => res.json());
  jsonEl.innerHTML =  `<pre>${JSON.stringify(jsonResults, undefined, 2)}</pre>`;

  const mobData = await fetch(`https://hopollocors.herokuapp.com/https://solomonk.fr/fr/monstre/${jsonResults.id}`).then(res => res.text());
  console.log(mobData);
  const img = mobData.split('https://solomonk.fr/img/monsters/artworks/')[1].split('.svg')[0];
  imgEl.setAttribute('src', `https://solomonk.fr/img/monsters/artworks/${img}`);
};