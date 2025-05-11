interface Problem {
  index: string;
  name: string;
  verdict: string;
  css: string;
}

interface Contest {
  List: Problem[];
}

let contest_list: any[];
const api_url = "https://codeforces.com/api/";
const prob = "problemset.problems";
const userinfo = "user.info";
const probsubmitted = "user.status";
let problems_div: HTMLElement | null = document.getElementById("problems");
let rating: HTMLElement | null = document.getElementById("rank_display");
let ptags: string[] = [];
let levels: string[] = [];
let handle: string = 'none';
let estimated_rating: number = 0;

// Vars for charts
let tags: any = {};
google.charts.load('current', { 'packages': ['corechart', 'calendar'] });
let titleTextStyle = {
  fontSize: 18,
  color: '#393939',
  bold: false
};
let colors = ['#f44336', '#E91E63', '#9C27B0', '#673AB7', '#2196F3', '#009688',
  '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B', '#E65100',
  '#827717', '#004D40', '#1A237E', '#6200EA', '#3F51B5', '#F50057', '#304FFE', '#b71c1c'];

function init(): void {
  problems_div = document.getElementById("problems");
  rating = document.getElementById("rank_display");

  let handleInp = document.getElementById("handle_inp");
  if (handleInp) {
    handleInp.addEventListener("keyup", function (event) {
      if ((event as KeyboardEvent).key === "Enter") {
        event.preventDefault();
        $('#display_values').click();
      }
    });
  }
}

function initialize(): void {
  $('#handle_display').text(handle)
  $('#Easy').text('')
  $('#Medium').text('')
  $('#Hard').text('')

  if (problems_div) problems_div.innerHTML = '';
  estimated_rating = 0;
  tags = {};

  // Initialize
  if (rating) rating.innerHTML = '';
  $('#max_rating_display').text("");
  $('#max_rank_display').text("");
  $('#current_rank_display').text("");
}

class ProblemImpl implements Problem {
  index: string;
  name: string;
  verdict: string;
  css: string;

  constructor(index: string, name: string, attempted: boolean, success: boolean) {
    this.index = index;
    this.name = name;
    if (attempted && success) {
      this.verdict = "Accepted";
      this.css = "accepted"
    } else if (attempted) {
      this.verdict = "Failed";
      this.css = "failed"
    } else {
      this.verdict = "Not Attempted"
      this.css = "notattempted"
    }
  }
}

class ContestImpl implements Contest {
  List: Problem[];

  constructor(data: any) {
    let problems = data.result.problems;
    let rows = data.result.rows;
    let l = rows.length;
    let n = problems.length;

    this.List = [];
    for (let i = 0; i < n; i++) {
      let attempted = false;
      let success = false;
      for (let j = 0; j < l; j++) {
        if (rows[j].problemResults[i].bestSubmissionTimeSeconds) {
          attempted = true;
          success = true;
          break;
        } else if (rows[j].problemResults[i].rejectedAttemptCount > 0) {
          attempted = true;
        }
      }

      this.List.push(new ProblemImpl(problems[i].index, problems[i].name, attempted, success))
    }
  }
}

function easyLow(x: number): number {
  x /= 100;
  let low = -21.2 + (25.5 * Math.exp(-0.02 * x));
  low *= 100;
  return low;
}

function easyHigh(x: number): number {
  x /= 100;
  let high = -32.1 + (37.2 * Math.exp(-0.01 * x));
  high *= 100;
  return high;
}

function mediumLow(x: number): number {
  x /= 100;
  let low = -38.8 + (44.8 * Math.exp(-0.008 * x));
  low *= 100;
  return low;
}

function mediumHigh(x: number): number {
  x /= 100;
  let high = -53.2 + (59.9 * Math.exp(-0.005 * x));
  high *= 100;
  return high;
}

function hardLow(x: number): number {
  x /= 100;
  let low = -32.0 + (39.9 * Math.exp(-0.008 * x));
  low *= 100;
  return low;
}

function hardHigh(x: number): number {
  x /= 100;
  let high = -30.8 + (39.6 * Math.exp(-0.006 * x));
  high *= 100;
  return high;
}

function display_problem_list(contestId: number): void {
  $.get('https://codeforces.com/api/contest.standings', { 'handles': handle, 'contestId': contestId, 'showUnofficial': true })
    .done(function (data: any, status: any) {
      let contest = new ContestImpl(data)
      for (let x of contest.List) {
        $('#' + contestId).append('<tr class="' + x.css + '">' +
          '<td>' + x.index + '</td>' +
          '<td>' + x.name + '</td>' +
          '<td>' + x.verdict + '</td>' +
          '</tr>');
      }
    })
    .fail(function (data: any, status: any) {
      console.clear()
      display_problem_list(contestId)
    })
}

function display_contest_list(): void {
  let x: any, count = 0;
  $('#contestlist *').remove()
  for (x of contest_list) {
    if (++count > 3) break;
    $('#contestlist').append('<div class="card">' +
      '<div class="card-body">' +
      '<h4><a href="https://codeforces.com/contest/' + x.contestId + '">' + x.contestName + '</a></h4>' +
      '<table class="table table-bordered">' +
      '<tbody id="' + x.contestId + '">' +
      '</tbody>' +
      '</table>' +
      '</div>' +
      '</div>');
    display_problem_list(x.contestId);
  }
  if (contest_list.length > 3) {
    $('#view_more').show();
  }
}

function view_more_fun(): void {
  let x: any, count = 0;
  for (x of contest_list) {
    if (++count > 3) {
      $('#contestlist').append('<div class="card">' +
        '<div class="card-body">' +
        '<h4><a href="https://codeforces.com/contest/' + x.contestId + '">' + x.contestName + '</a></h4>' +
        '<table class="table table-bordered">' +
        '<tbody id="' + x.contestId + '">' +
        '</tbody>' +
        '</table>' +
        '</div>' +
        '</div>');
      display_problem_list(x.contestId);
    }
  }
}

function err_message(msg: string): void {
  alert(msg);
  if (problems_div) problems_div.innerHTML = '';
}

function RecommendProb(): void {
  let user_prob_set: string[] = [];
  ptags = [];

  $.get(api_url + probsubmitted, { 'handle': handle }, function (data: any, status: any) {
    let status1 = data["status"];
    if (status != "success" || status1 != "OK") {
      err_message("Get your net checked BRO!!");
      return;
    }
    let res = data.result;
    for (let i = 0; i < res.length; i++) {
      if (user_prob_set.includes(res[i].problem.contestId + "_" + res[i].problem.name)) continue;
      user_prob_set.push(res[i].problem.contestId + "_" + res[i].problem.name);
      let probtag = res[i].problem.tags;
      for (let t = 0; t < probtag.length; t++) {
        if (!ptags.includes(probtag[t])) ptags.push(probtag[t]);
        if (res[i].verdict == 'OK') {
          if (tags[probtag[t]] === undefined) tags[probtag[t]] = 1;
          else tags[probtag[t]]++;
        }
      }
    }
    if (typeof google.visualization === 'undefined') {
      google.charts.setOnLoadCallback(drawCharts);
    } else {
      drawCharts();
    }

    tags_n_ratings(ptags, user_prob_set);
  });
}

function capitalize(str: string): string {
  if (str) {
    return str.replace(/\w\S*/g, function (txt: string) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }
  return "";
}

function tags_n_ratings(ptags: string[], user_prob_set: string[]): void {
  $.get(api_url + userinfo, { 'handles': handle })
    .done(function (data: any, status: any) {
      let status1 = data["status"];
      if (status != "success" || status1 != "OK") {
        err_message("Get your net checked BRO!!");
        return;
      }

      let curr_rating = data.result[0]["rating"];
      let curr_rank = data.result[0]["rank"];
      let maxRating = data.result[0]["maxRating"];
      let max_rank = data.result[0]["maxRank"];
      if (rating) rating.innerHTML = '';

      let rating_color = { 'newbie': 'gray', 'pupil': 'green', 'specialist': 'cyan', 'expert': 'blue', 'candidate master': 'violet', 'master': 'orange', 'international master': 'orange', 'grandmaster': 'red', 'international grandmaster': 'red', 'legendary grandmaster': 'red' };

      if (contest_list.length == 0) {
        if (rating) $(rating).css('color', 'black').text("NA");
        $('#max_rating_display').css('color', 'black').text("NA");
        $('#max_rank_display').css('color', 'black').text("");
        $('#current_rank_display').css('color', 'black').text("Not yet defined");
      } else {
        if (rating) $(rating).css('color', rating_color[curr_rank as keyof typeof rating_color] || 'black').text(curr_rating);
        $('#max_rating_display').css('color', rating_color[max_rank as keyof typeof rating_color] || 'black').text(maxRating);
        $('#max_rank_display').css('color', rating_color[max_rank as keyof typeof rating_color] || 'black').text("(" + capitalize(max_rank) + ")");
        $('#current_rank_display').css('color', rating_color[curr_rank as keyof typeof rating_color] || 'black').text(capitalize(curr_rank));
      }

      if (ptags.length == 0 || curr_rating < 800 || curr_rating == undefined) {
        ptags = ["math", "greedy", "sortings", "brute force", "implementation"];
        curr_rating = 800;
        estimated_rating = 800;
      }

      EMH(curr_rating, user_prob_set);
    })
    .fail(function (data: any, status: any) {
      console.clear();
      tags_n_ratings(ptags, user_prob_set)
    });
}

function EMH(rating: number, usersubmits: string[]): void {
  $.get(api_url + prob, { 'tags': "" })
    .done(function (data: any, status: any) {
      let status1 = data["status"];
      if (status != "success" || status1 != "OK") {
        err_message("Get your net checked BRO!!");
        return;
      }
      let pset = data.result.problems;
      if (pset.length == 0) {
        err_message("No Recommendations");
        return;
      }

      let total_no_prob = pset.length;
      let set_of_prob = new Set();
      let get_prob_url = "https://codeforces.com/contest/";
      let not_attempted_prob = [];

      for (let i = 0; i < total_no_prob; i++) {
        if (!usersubmits.includes(pset[i].contestId + "_" + pset[i].name)) not_attempted_prob.push(pset[i]);
      }

      pset = not_attempted_prob;
      total_no_prob = pset.length;

      let level = ["Easy", "Medium", "Hard"];

      let round_rating = estimated_rating % 100
      if (round_rating < 50) round_rating = estimated_rating - round_rating;
      else round_rating = estimated_rating + 100 - round_rating;

      for (let index in level) {
        let low: number, high: number;
        if (index == "0") {
          low = easyLow(round_rating) + round_rating;
          high = easyHigh(round_rating) + round_rating;
        } else if (index == "1") {
          low = mediumLow(round_rating) + round_rating;
          high = mediumHigh(round_rating) + round_rating;
        } else {
          low = hardLow(round_rating) + round_rating;
          high = hardHigh(round_rating) + round_rating;
        }

        let checks = 0;
        let ctr = 1;

        let card_div = document.getElementById(level[index])

        while (ctr <= Math.min(5, total_no_prob)) {
          checks += 1;
          if (checks > 1000 * total_no_prob) {
            break;
          }
          let idx = Math.floor(Math.random() * total_no_prob);
          if (!set_of_prob.has(idx) && pset[idx]["rating"] <= high && pset[idx]["rating"] >= low) {
            if (ctr == 1) {
              let heading = '<h2 class="recommend"><u>' + level[index] + '</u>:</h2>';
              if (card_div) card_div.innerHTML += heading;
            }
            let problem_url = get_prob_url + pset[idx].contestId.toString() + "/problem/" + pset[idx].index;
            let problem_name = pset[idx].name;
            problem_name = problem_name.link(problem_url);
            if (card_div) card_div.innerHTML += ctr + ". " + problem_name + " (" + pset[idx].rating + ")<br>";
            set_of_prob.add(idx);
            ctr++;
          }
        }
      }
    })
    .fail(function (data: any, status: any) {
      console.clear();
      EMH(rating, usersubmits)
    });
}

function drawCharts(): void {
  $('#tags').removeClass('hidden');
  let tagTable: any[] = [];
  for (let tag in tags) {
    tagTable.push([tag + ": " + tags[tag], tags[tag]]);
  }
  tagTable.sort(function (a: any, b: any) {
    return b[1] - a[1];
  });
  tags = new google.visualization.DataTable();
  tags.addColumn('string', 'Tag');
  tags.addColumn('number', 'solved');
  tags.addRows(tagTable);
  
  let tagOptions: google.visualization.PieChartOptions = {
    width: Math.max(600, $('#tags').width() ?? 0),
    height: Math.max(600, $('#tags').width() ?? 0) * 0.75,
    chartArea: { width: '80%', height: '100%' },
    title: 'Tags of ' + handle,
    pieSliceText: 'none',
    legend: {
      position: 'right',
      alignment: 'center', 
      textStyle: {
        fontSize: 12,
        fontName: 'Roboto',
      }
    },
    pieHole: 0.5,
    tooltip: {},
    fontName: 'Roboto',
    titleTextStyle: titleTextStyle,
    colors: colors.slice(0, Math.min(colors.length, tags.getNumberOfRows())),
  };

  const tagsElement = document.getElementById('tags');
  if (tagsElement) {
    let tagChart = new google.visualization.PieChart(tagsElement);
    tagChart.draw(tags, tagOptions);
  }
}

$(document).ready(function (): void {
  init();

  $('#display_values').click(function (): void {
    initialize();
    handle = $('#handle_inp').val() as string
    $.get(api_url + "user.rating", { 'handle': handle })
      .done(function (data: any, status: any) {
        contest_list = data.result.reverse()

        $('#alert_message').hide();
        $('#display_block').show();
        $('#handle_display').text(handle)
        $('#contest_display').text(contest_list.length)
        $('#recm_handle').text(handle)
        $('#nocontests').hide()
        $('#chart').show()
        $('#chart_error').hide()

        if (contest_list.length == 0) {
          $('#recent_contests').text("User has yet to participate in a contest!")
          $('#nocontests').show()
          $('#chart').hide()
          $('#chart_error').show()
        } else $('#recent_contests').text("")

        for (let i = 0; i < Math.min(5, contest_list.length); i++) estimated_rating += contest_list[i].newRating
        if (contest_list.length != 0) estimated_rating /= Math.min(5, contest_list.length)
        estimated_rating = Math.round(estimated_rating)

        RecommendProb();
        display_contest_list()
      })
      .fail(function (data: any, status: any) {
        $('#display_block').hide();
        $('#alert_message').show();
      })
  });

  $('#view_more').click(function (): void {
    view_more_fun();
    $('#view_more').hide()
  })
});