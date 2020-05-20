

import * as d3 from "d3"

export function abbreviateString(value, maxLength) {
    if (value.length <= maxLength) {
        return value
    } else {
        let retval = value.substring(0, maxLength) + ".."
        return retval
    }
}


function intlFormat(num) {
    return new Intl.NumberFormat().format(Math.round(num * 10) / 10);
}
export function makeFriendly(num) {
    if (num < 1 && num > 0) {
        return num
    }
    if (Math.abs(num) >= 1000000)
        return intlFormat(num / 1000000) + 'M';
    if (Math.abs(num) >= 1000)
        return intlFormat(num / 1000) + 'k';
    return intlFormat(num);
}

export function getJSONData(url) {
    return fetch(url).then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        return response.json().then(function (data) {
            return data
        });
    }).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });
}


export function postJSONData(url, postData) {
    return fetch(url, {
        method: "post",
        body: JSON.stringify(postData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
        }
        return response.json().then(function (data) {
            return data
        });
    }).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });
}


export function ColorArray() {
    let colorArray = [
        "#1f78b4",
        "#b2df8a",
        "#33a02c",
        "#fb9a99",
        "#e31a1c",
        "#fdbf6f",
        "#ff7f00",
        "#6a3d9a",
        "#cab2d6",
        "#ffff99",
        "#8fff4f"
    ]
    return colorArray
}

export function ColorExplanation(rowMin, rowMax, rowValue) {
    let color = d3.scaleQuantize()
        .domain([rowMin, rowMax])
        .range(['#d6604d',
            '#f4a582',
            '#fddbc7',
            '#f7f7f7',
            '#d1e5f0',
            '#92c5de',
            '#4393c3']);
    return color(rowValue)
}

export function ColorArrayRGB() {
    let colorArray = [
        [141, 211, 199],
        [255, 255, 179],
        [190, 186, 218],
        [251, 128, 114],
        [128, 177, 211],
        [253, 180, 98],
        [179, 222, 105],
        [252, 205, 229],
        [188, 128, 189],
        [204, 235, 197],
    ]
    return colorArray
}
export const explanationColor = d3.scaleQuantize()
    .domain([-0.5, 0.8])
    .range([
        '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d'
    ]);
export const probabilityColor = d3.scaleQuantize()
    .domain([0, 0.8])
    .range([
        '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d'
    ]);
