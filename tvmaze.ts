import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface ShowFromApiInterface {
  id: number;
  name: string;
  summary: string;
  image: { medium: string; } | null;
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get(
    `https://api.tvmaze.com/search/shows?q=${term}`,
  );

  // console.log("response.data", response.data);
  // console.log("img is", response.data[0].show.image);
  // console.log("img medium is", response.data[0].show.image.medium);

  return response.data.map((show: { show: ShowFromApiInterface; }) => {
    //var show in map is of type object with key of show
    return {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image?.medium || "http://tinyurl.com/tv-missing"
      // image: show.show.image
      //   ? show.show.image.medium
      //   : "http://tinyurl.com/tv-missing"
    };

  });

}

/** Given list of shows, create markup for each and append to DOM */

function populateShows(shows: ShowInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="http://tinyurl.com/tv-missing"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows: ShowInterface[] = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});



/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await axios.get(
    `https://api.tvmaze.com/shows/${id}/episodes`,
  );

  // const show = response.data;
  console.log("response.data ", response.data)

  return response.data.map((episode: EpisodeInterface) => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    };
  }
  );

}

/** Given list of episodes, create markup for each and append to DOM */

function populateEpisodes(episodes: EpisodeInterface[]) {
  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (Season ${episode.season}, Number ${episode.number})</li>`);

    $episodesArea.append($episode);
  }
}

async function getEpisodesAndDisplay(evt: Event) {
  evt.preventDefault();
  console.log(evt)
  const episodes: EpisodeInterface[] = await getEpisodesOfShow(139);

  $episodesArea.show();
  populateEpisodes(episodes);
}

$('#showsList').on('click', "button", getEpisodesAndDisplay)

// $searchForm.on("submit", async function (evt) {
//   evt.preventDefault();
//   await searchForShowAndDisplay();
// });