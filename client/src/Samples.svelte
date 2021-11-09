<script>
  import Bar from "./Bar.svelte";
  import {
    upload,
    samples,
    samplesRatio,
    currentHypothesis,
    zoomImg,
  } from "./stores.js";
</script>

<div class="flex flex-column items-center w-100 mt1 bt b--black-10">
  <div class="inline-flex w-100 items-center flex-wrap">
    <h3 class="subtitle pt1 ph2">More Examples</h3>
    <div class="tooltip" data-direction="bottom">
      <div class="tooltip__initiator">
        <i class="pt1 f5 la la-info-circle" />
      </div>
      <div class="tooltip__item">
        <p>
          Click the bottom button to indicate whether the model's prediction is
          correct or incorrect.
          <span class="green b">Green</span>
          indicates the model's prediction is correct, while
          <span class="red b">red</span>
          indicates it is incorrect.
        </p>
      </div>
    </div>
    <Bar ratio={samplesRatio} txt={"correct"} />
  </div>
  {#if $samples[$currentHypothesis].length === 0}
    <p class="f6 tc pa2 mh2 ba br2 b--black-10">
      Test your hypothesis by finding additional examples that share the
      hypothesized error reason.
    </p>
  {/if}
  <div class="inline-flex overflow-x-scroll w-100 mt2 mb1">
    {#each $samples[$currentHypothesis] as sample, i}
      <article
        class="ma1 br2 bw1 b--black-10 ba dark-gray {sample.corr === 1
          ? 'b--green b-corr'
          : ''}
        {sample.corr === 0 ? 'b--red b-wrong' : ''}
        "
        style="min-width:100px"
      >
        <img
          src="/img/{sample.name}"
          class="mh2 mt2 db br2 br--top thumb center"
          alt="Additional sample instance"
          on:mouseenter={(_) => zoomImg.set(sample.name)}
          on:mouseleave={(_) => zoomImg.set("")}
        />
        <div class="w-100 inline-flex justify-between items-center">
          <p class="tc f5 ma2">{sample.pred}</p>
          <button
            class="ma2 raised-btn"
            on:click={(_) =>
              samples.update((c) => {
                let curr = c[$currentHypothesis];
                curr[i].corr === 0 || curr[i].corr === -1
                  ? (curr[i].corr = 1)
                  : (curr[i].corr = 0);
                return c;
              })}
          >
            <i class="las la-check-circle" />
          </button>
        </div>
      </article>
    {/each}
  </div>
  <button class="raised-btn-txt" on:click={(_) => upload.set("sample")}>
    Upload Images
  </button>
</div>
