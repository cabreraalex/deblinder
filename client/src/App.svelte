<script>
  import Embedding from "./Embedding.svelte";
  import Reports from "./Reports.svelte";
  import Upload from "./Upload.svelte";
  import Hypotheses from "./Hypotheses.svelte";
  import Tools from "./Tools.svelte";

  import { start, upload, zoomImg, zoomPred, preds } from "./stores.js";
  import { onMount } from "svelte";

  onMount((d) => {
    start();
  });
</script>

{#if $zoomImg.length !== 0}
  <div
    class="tc bg-second absolute abs-top ma2 pa2 br2 ba dark-gray b--black-10"
    style="width:220px"
  >
    <img class="" src={"/img/" + $zoomImg} alt="zoomed instance" />
    <h5 class="pa1 mt1 small-caps">model output</h5>
    <p class="f6 pb1">{$preds.get($zoomImg)}</p>
    {#if $zoomPred.length !== 0}
      <h5 class="pa1 mt1 small-caps">report</h5>
      <p class="f6 pb1 tc w-100">{$zoomPred}</p>
    {/if}
  </div>
{/if}
<Upload type={$upload} />
<div class="flex" style="min-width:1100px">
  <div class="leftside">
    <div class="bg-first white h-top dt w-100 bb b--light-gray">
      <div class="inline-flex h-inherit items-center">
        <h2 class="pl3 v-mid white">Deblinder</h2>
        <h2 class="pl4 v-mid white">
          <a class="white" href="https://dl.acm.org/doi/10.1145/3479569">
            <i class="f2 v-mid las la-file-alt" />
          </a>
        </h2>
        <p class="pl1 v-mid white">
          <a
            class="white"
            href="https://dl.acm.org/action/downloadSupplement?doi=10.1145%2F3479569&file=v5cscw425vf.mp4"
          >
            <i class="v-mid lab la-youtube" style="font-size:2.25rem" />
          </a>
        </p>
        <h2 class="pl1 v-mid white">
          <a class="white" href="https://github.com/cabreraalex/deblinder">
            <i class="f2 lab la-github" />
          </a>
        </h2>
      </div>
      <Tools />
    </div>
    <div class="explore bb b--light-gray">
      <Embedding />
    </div>
    <div class="search bg-second">
      <Reports />
    </div>
  </div>
  <div id="hypos" class="vh-100 bl b--black-10 bg-second">
    <Hypotheses />
  </div>
</div>

<style>
  .explore {
    height: calc(100vh - 14.5rem);
  }
  .search {
    height: 10rem;
    width: 100%;
  }
  .leftside {
    width: calc(100% - 25rem);
  }
  #hypos {
    min-width: 25rem;
    width: 25rem;
  }
</style>
