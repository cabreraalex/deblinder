<script>
  import {
    selDescs,
    selImgs,
    selTag,
    hypotheses,
    currentHypothesis,
    sentences,
    zoomImg,
    zoomPred,
    hoverSen,
  } from "./stores.js";

  let search;

  function searchReports() {
    let filt = $sentences.filter((d) => d.desc.includes(search));
    selDescs.set(filt.map((d) => d.desc));
    selImgs.set(filt.map((d) => d.img));
    selTag.set(search);
    search = "";
  }

  function addReport(img, i) {
    hypotheses.update((l) => {
      let currHypo = l[$currentHypothesis];
      currHypo.imgs.add(img);
      currHypo.descs.add($selDescs[i]);
      return l;
    });
  }

  function addAllReports() {
    hypotheses.update((l) => {
      let currHypo = l[$currentHypothesis];
      $selImgs.forEach((d) => currHypo.imgs.add(d));
      $selDescs.forEach((d) => currHypo.descs.add(d));
      return l;
    });
  }
</script>

<div class="w-100 bt b--light-gray" style="height: 100%">
  <div
    class="bg-first w-100 bb b--black-10 inline-flex items-center
    justify-between"
  >
    <h4 class="pl3 f5 white small-caps">reports</h4>
    <h5 class="f6 white">
      {$selImgs.length !== 0 ? $selImgs.length + " reports with " : ""}
      <i class="pl2">{$selTag}</i>
    </h5>
    <div class="ma2 inline-flex">
      <button
        class="raised-btn-txt mr4"
        href="#0"
        on:click={(_) => addAllReports()}
      >
        Add All
      </button>
      <input
        bind:value={search}
        type="text"
        class="searchTerm"
        placeholder="Search reports."
        on:keydown={(d) => (d.keyCode === 13 ? searchReports() : null)}
      />
      <button
        type="submit"
        class="raised-btn"
        on:click={(_) => searchReports()}
      >
        <i class="la la-search ph1" />
      </button>
    </div>
  </div>
  <div class="inline-flex overflow-x-scroll w-100">
    {#each $selImgs as img, i}
      <article
        class="report ma1 br2 ba dark-gray b--black-10 inline-flex w-100
        items-center {$hypotheses[$currentHypothesis].imgs.has(img)
          ? 'b--green b-corr'
          : 'b--black-10'}"
        style="height: 6rem; min-width: {150 +
          50 * ($selDescs[i].length / 18)}px"
        on:mouseenter={(_) => hoverSen.set($selDescs[i])}
        on:mouseleave={(_) => hoverSen.set("")}
      >
        <img
          src="/img/{img}.jpg"
          class="ma1 db br2 br--top thumb"
          width="75px"
          alt="Reported instance"
          on:mouseenter={(_) => {
            zoomPred.set($selDescs[i]);
            zoomImg.set(img + ".jpg");
          }}
          on:mouseleave={(_) => {
            zoomPred.set("");
            zoomImg.set("");
          }}
        />
        <p class="f6 lh-copy ma1 mid-gray">
          {@html $selDescs[i].split($selTag).join("<b>" + $selTag + "</b>")}
        </p>
        <div class="flex flex-column tr h-100 ml-auto pl2">
          {#if $hypotheses[$currentHypothesis].imgs.has(img)}
            <a
              href="#0"
              title="Remove instance"
              on:click={(d) => {
                hypotheses.update((d) => {
                  let currHyp = d[$currentHypothesis];
                  currHyp.imgs.delete(img);
                  currHyp.descs.delete($selDescs[i]);
                  return d;
                });
              }}
            >
              <button class="ma2 raised-btn" href="#0">
                <i class="red pointer las la-times" />
              </button>
            </a>
          {:else}
            <button
              class="ma2 raised-btn"
              href="#0"
              title="Add to hypothesis"
              on:click={addReport(img, i)}
            >
              <i class="c-first pointer las la-plus" />
            </button>
          {/if}
        </div>
      </article>
    {/each}
  </div>
</div>
