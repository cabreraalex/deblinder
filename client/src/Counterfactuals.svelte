<script>
  import Bar from "./Bar.svelte";
  import {
    counters,
    countersRatio,
    currentHypothesis,
    zoomImg
  } from "./stores.js";
</script>

<div class="w-100">
  <div class="inline-flex w-100 flex-wrap items-center">
    <h3 class="subtitle mh2">Modified Instances</h3>
    <div class="tooltip" data-direction="bottom">
      <div class="tooltip__initiator">
        <i class="pt1 f5 la la-info-circle" />
      </div>
      <div class="tooltip__item">
        <p>
          Click the center button to indicate whether the expected change
          happened.
          <span class="green b">Green</span>
          indicates the model's prediction changed as expected, while
          <span class="red b">red</span>
          indicates it did not.
        </p>
      </div>
    </div>
    <Bar ratio={countersRatio} txt={'changed'} />
  </div>
  {#if $counters[$currentHypothesis].length === 0}
    <p class="f6 tc pa2 mh2 ba br2 b--black-10">
      Test your hypothesis by modifying the reported instances
    </p>
  {/if}
  <div class="inline-flex overflow-x-scroll w-100 mt2">
    {#each $counters[$currentHypothesis] as counter, i}
      <article
        class="ma2 inline-flex items-center br2 bw1 b--black-10 ba dark-gray {counter.corr === 1 ? 'b--green b-corr' : ''}
        {counter.corr === 0 ? 'b--red b-wrong' : ''}
        ">
        <div>
          <img
            src="/img/{counter.name}"
            class="ma1 db br2 br--top thumb"
            alt="original image"
            on:mouseenter={_ => zoomImg.set(counter.name)}
            on:mouseleave={_ => zoomImg.set('')} />
          <p class="tc pa1 f5">{counter.og}</p>
        </div>
        <div class="relative h-100 tc">
          <button
            class="ma2 raised-btn"
            on:click={_ => {
              counters.update(c => {
                let curr = c[$currentHypothesis];
                curr[i].corr === 0 || curr[i].corr === -1 ? (curr[i].corr = 1) : (curr[i].corr = 0);
                return c;
              });
            }}>
            <i class="las la-redo-alt" />
          </button>
          <i class="w-100 absolute bottom-0 left-0 pt2 f3 las la-arrow-right" />
        </div>
        <div>
          <img
            src="/img/{counter.name}"
            class="ma1 db br2 br--top thumb"
            alt="modified image"
            on:mouseenter={_ => zoomImg.set(counter.name)}
            on:mouseleave={_ => zoomImg.set('')} />
          <p class="tc pa1 f5">{counter.mod}</p>
        </div>
      </article>
    {/each}
  </div>
</div>
