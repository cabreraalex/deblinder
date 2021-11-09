<script>
  import {
    data,
    keywords,
    umap,
    umapSolution,
    filter,
    sentences,
  } from "./stores.js";

  let newWord = "";

  function addWord() {
    if ($keywords.map((d) => d.tag).includes(newWord)) return;

    let count = 0;
    let imgs = [];
    let descs = [];
    $data.forEach((sen) => {
      if (sen["description"].includes(newWord)) {
        count++;
        imgs.push(sen["image"]);
        descs.push(sen["description"]);
      }
    });

    fetch("./vec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sen: newWord }),
    })
      .then((d) => d.json())
      .then((d) => {
        keywords.update((m) => {
          let arr = [...m];
          arr.push({
            tag: newWord,
            count: count,
            vec: d,
            imgs: imgs,
            descs: descs,
          });
          return arr;
        });
        umapSolution.update((m) => {
          let arr = [...m];
          arr.push($umap.transform([d])[0]);
          return arr;
        });
        newWord = "";
      });
  }
</script>

<div class="inline-flex fr">
  <div class="pr4 tc">
    <p class="f6 pt2 pb1 i">reports</p>
    <h3 class="f4 pv1">{$sentences.length}</h3>
  </div>
  <div class="ph2">
    <p class="f6 pt2 pb1 i">add keyword</p>
    <div class="inline-flex">
      <input
        class="w4 h2 br2"
        bind:value={newWord}
        on:keydown={(d) => (d.keyCode === 13 ? addWord() : null)}
      />
      <button class="raised-btn-txt ml1" on:click={addWord}>Add</button>
    </div>
  </div>
  <div class="pl3 pr4">
    <p class="f6 pt2 pb1 i">filter</p>
    <input class="w4 h2 br2" bind:value={$filter} />
  </div>
</div>
