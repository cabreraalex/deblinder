<script>
  import * as d3 from "d3";
  import {
    keywords,
    umapSolution,
    filter,
    selDescs,
    selImgs,
    selTag,
    hoverSen,
    zoomImg,
    zoomPred,
  } from "./stores.js";

  let el;
  let svg;
  let height;
  let width;
  $: width, height, initEmbed(), renderEmbed();

  let scale = 1;
  $: scale, renderEmbed();

  let pinned = false;
  let hovering = false;
  let word;
  let oldColor = "";

  let domains = {};
  let scales = {};
  let margin = 20;

  filter.subscribe((_) => renderEmbed());
  hoverSen.subscribe((_) => renderEmbed());
  umapSolution.subscribe((d) => {
    if ($umapSolution.length !== 0) {
      initEmbed();
      renderEmbed();
    }
  });

  function renderEmbed() {
    if (!svg) return;

    let keys = $keywords;
    keys.forEach((key, index) => {
      key.position = $umapSolution[index];
      key.filtered = false;
      key.hypo = false;
    });

    // Optimization for searching for hovers and filters.
    if ($hoverSen.length > 0 && $filter.length > 0) {
      keys.forEach((key) => {
        key.tag.includes($filter) ? (key.filtered = true) : "";
        $hoverSen.includes(key.tag) ? (key.hypo = true) : "";
      });
    } else if ($hoverSen.length > 0) {
      keys.forEach((key) => {
        $hoverSen.includes(key.tag) ? (key.hypo = true) : "";
      });
    } else if ($filter.length > 0) {
      keys.forEach((key) => {
        key.tag.includes($filter) ? (key.filtered = true) : "";
      });
    }
    drawKey(keys);
  }

  function initEmbed() {
    domains = $umapSolution.reduce(
      (memo, [x, y]) => ({
        x: [Math.min(memo.x[0], x), Math.max(memo.x[1], x)],
        y: [Math.min(memo.y[0], y), Math.max(memo.y[1], y)],
      }),
      {
        x: [Infinity, -Infinity],
        y: [Infinity, -Infinity],
      }
    );

    scales = {
      x: d3
        .scaleLinear()
        .domain(domains.x)
        .range([margin, width - margin]),
      y: d3
        .scaleLinear()
        .domain(domains.y)
        .range([margin, width - margin]),
      w: d3
        .scaleLinear()
        .domain(d3.extent($keywords, (d) => d.count))
        .range([12, 36]),
      c: d3.scaleLog().domain([1, 36]).range([0.2, 1]),
    };

    svg = d3
      .select(el)
      .attr("width", width)
      .attr("height", height)
      .on("click", (_) => (!hovering ? svg.selectAll(".hov").remove() : null));

    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 40])
        .on("zoom", function (_) {
          scale = d3.zoomTransform(svg.node()).k;
          return svg.select("g").attr("transform", d3.zoomTransform(this));
        })
    );
  }

  function drawKey(keys) {
    const scaleInv = 1 / scale;

    const layer = svg.select("g");
    const node = layer.selectAll("text").data(keys, (d) => (d ? d.tag : null));
    node
      .enter()
      .insert("text")
      .text((d) => d.tag)
      .attr("x", (d) => scales.x(d.position[0]))
      .attr("y", (d) => scales.y(d.position[1]))
      .merge(node)
      .on("mouseover", function (_, d) {
        layer.selectAll(".hov").remove();
        pinned = false;
        document.documentElement.style.cursor = "pointer";

        const word = d3.select(this);
        oldColor = word.attr("fill");
        word.attr("fill", "#547ab7").attr("font-weight", "bold");

        const wordBox = this.getBBox();
        const h = 150;
        const w =
          wordBox.width > 300
            ? (wordBox.width + 10) * scaleInv
            : 300 * scaleInv;
        let rect = layer
          .insert("rect")
          .attr("class", "hov")
          .attr("x", wordBox.x - (w - wordBox.width) / 2)
          .attr("y", wordBox.y - (h * scaleInv) / 2)
          .attr("width", w)
          .attr("height", wordBox.height + h * scaleInv)
          .attr("rx", 5 * scaleInv)
          .attr("stroke", "rgba(0, 0, 0, 0.1)")
          .attr("stroke-width", 2 * scaleInv)
          .attr("fill", "#f3f3f3");
        word.raise();

        let boxBox = rect.node().getBBox();
        let imgH = (boxBox.height - wordBox.height - 40 * scaleInv) / 2;
        d.imgs.forEach((img, i) => {
          if (i < 3) {
            layer
              .append("image")
              .attr("class", "hov")
              .attr("href", "/img/" + img + ".jpg")
              .attr("x", boxBox.x + imgH * i + 10 * scaleInv)
              .attr("y", boxBox.y + 10 * scaleInv)
              .attr("height", imgH)
              .attr("width", 1.22 * imgH)
              .on("mouseenter", (_) => {
                zoomImg.set(img + ".jpg");
                zoomPred.set(d.descs[i]);
              })
              .on("mouseleave", (_) => {
                zoomImg.set("");
                zoomPred.set("");
              });
          }
        });
        if (d.imgs.length > 3) {
          layer
            .append("text")
            .attr("class", "hov")
            .text("and " + (d.imgs.length - 3) + " more")
            .attr("x", boxBox.x + imgH * 4 - 10 * scaleInv)
            .attr("y", boxBox.y + imgH / 2 + 16 * scaleInv)
            .attr("font-size", 12 * scaleInv);
        }
        d.descs.forEach((desc, i) => {
          if (i < 3) {
            let words = desc.split(d.tag);
            let firstHalf = words[0].split(" ");
            let secondHalf = words[1].split(" ");

            let first =
              firstHalf.length < 3
                ? firstHalf.join(" ")
                : "..." + firstHalf.slice(-3).join(" ");
            let second =
              secondHalf.length < 3
                ? secondHalf.join(" ")
                : secondHalf.slice(0, 3).join(" ") + "...";

            let txtElem = layer
              .append("text")
              .attr("class", "hov")
              .text(first)
              .attr(
                "y",
                wordBox.y + wordBox.height + 30 * scaleInv + 16 * scaleInv * i
              )
              .attr("font-size", 12 * scaleInv);
            txtElem
              .append("tspan")
              .attr("class", "hov")
              .text(d.tag)
              .attr("font-size", 12 * scaleInv)
              .attr("font-weight", "bold")
              .attr("fill", "#547ab7");
            txtElem
              .append("tspan")
              .attr("class", "hov")
              .text(second)
              .attr("font-size", 12 * scaleInv);
            let txtX = txtElem.node().getBBox().width;
            txtElem.attr("x", boxBox.x + boxBox.width / 2 - txtX / 2);
          }
        });
        hovering = true;
      })
      .on("click", tagClick)
      .on("mouseout", function (_) {
        document.documentElement.style.cursor = "default";
        word = d3.select(this);
        word.attr("fill", oldColor);
        word.attr("font-weight", "normal");
        if (!pinned) {
          layer.selectAll(".hov").remove();
        }
        hovering = false;
      })
      .attr("fill", (d) => {
        if (d.hypo) {
          return "#ff4136";
        } else if (d.filtered) {
          return "#ff4136";
        } else {
          return "rgba(0, 0, 0, " + scales.c(d.count) * scale + ")";
        }
      })
      .attr("font-size", (d) => scales.w(d.count) * (1 / scale) + "px")
      .exit();
  }

  function tagClick(_, d) {
    selImgs.set(d.imgs);
    selDescs.set(d.descs);
    selTag.set(d.tag);
    pinned = true;
  }
</script>

<div
  id="svg"
  bind:clientWidth={width}
  bind:clientHeight={height}
  class="w-100 h-100"
>
  <svg bind:this={el}>
    <g />
  </svg>
</div>
