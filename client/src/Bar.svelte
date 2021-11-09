<script>
  export let ratio;
  export let txt;

  let barWidth = 150;
  let barHeight = 15;
  let vPad = 13;
</script>

<div
  class="pa2 mr4 ml-auto"
  style="min-width: 100px; max-width: 150px; height: 40px;"
  bind:clientWidth={barWidth}
>
  {#if $ratio.pos + $ratio.neg + $ratio.base !== 0}
    <svg width="150px" height="40px">
      <rect
        width="{barWidth * $ratio.pos}px"
        height="{barHeight}px"
        y="{vPad}px"
        fill="#19a974"
      />
      <rect
        width="{barWidth * $ratio.neg}px"
        height="{barHeight}px"
        x="{barWidth * $ratio.pos}px"
        y="{vPad}px"
        fill="#ff4136"
      />
      <rect
        width="{barWidth * $ratio.base}px"
        height="{barHeight}px"
        x="{barWidth * ($ratio.pos + $ratio.neg)}px"
        y="{vPad}px"
        fill="rgba(0, 0, 0, 0.1)"
      />
      <text font-size="12px" y="10px">
        {Math.round(
          ($ratio.pos / ($ratio.neg + $ratio.pos + 0.000001)) * 100,
          2
        ) +
          "% " +
          txt +
          " of " +
          $ratio.len}
      </text>
    </svg>
  {/if}
</div>
