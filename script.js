const baseUrl = "https://www.themealdb.com/api/json/v1/1";
const $ = (selector) => document.querySelector(selector);
const createEl = (tagName) => document.createElement(tagName);

const fetchData = (route) => fetch(`${baseUrl}/${route}`).then((response) => response.json());
const localData = (method, key, data) => method === "set" ? localStorage.setItem(key, JSON.stringify(data)) : JSON.parse(localStorage.getItem(key));

const getMealById = (id) => fetchData(`lookup.php?i=${id}`).then(({ meals }) => meals[0]);
const getMealsBySearch = (term) => fetchData(`search.php?s=${term}`).then(({ meals }) => meals);
const removeMealLS = (mealId) => localData("set", "mealIds", getMealsLS().filter((id) => id !== mealId));

function addMeal(mealData, random = false) {
  const meal = createEl("div");

  meal.classList.add("meal");
  meal.innerHTML = `
    <div class="meal-header">
      ${random ? `<span class="random"> Random Recipe </span>` : ""}
      <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
      />
    </div>
    <div class="meal-body">
      <h4>${mealData.strMeal}</h4>
      <button class="fav-btn">
        <i class="fas fa-heart"></i>
      </button>
    </div>
  `;

  const btn = meal.querySelector(".meal-body .fav-btn");

  btn.onclick = () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      localData("set", "mealIds", [...getMealsLS(), mealData.idMeal]);
      btn.classList.add("active");
    }

    fetchFavMeals();
  };
  meal.onclick = () => showMealInfo(mealData);

  $("#meals").appendChild(meal);
}

function getMealsLS() {
  const mealIds = localData("get", "mealIds");
  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  $("#fav-meals").innerHTML = "";
  getMealsLS().forEach(async (mealId) => addMealFav(await getMealById(mealId)));
}

function addMealFav(mealData) {
  const favMeal = createEl("li");

  favMeal.innerHTML = `
    <img
      src="${mealData.strMealThumb}"
      alt="${mealData.strMeal}"
    />
    <span>${mealData.strMeal}</span>
    <button class="clear">
      <i class="fas fa-window-close"></i>
    </button>
  `;

  const btn = favMeal.querySelector(".clear");

  btn.onclick = () => {
    removeMealLS(mealData.idMeal);
    fetchFavMeals();
  };

  favMeal.onclick = () => showMealInfo(mealData);

  $("#fav-meals").appendChild(favMeal);
}

function showMealInfo(mealData) {
  $("#meal-info").innerHTML = "";

  const mealEl = createEl("div");
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) ingredients.push(`${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`);
  }

  mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img
      src="${mealData.strMealThumb}"
      alt="${mealData.strMeal}"
    />
    <p>${mealData.strInstructions}</p>
    <h3>Ingredients:</h3>
    <ul>${ingredients.map((ing) => `<li>${ing}</li>`).join("")}</ul>
  `;

  $("#meal-info").appendChild(mealEl);
  $("#meal-popup").classList.remove("hidden");
}

(async function() {
  const { meals } = await fetchData("random.php");
  addMeal(meals[0], true);
})();

fetchFavMeals();

$("#search").addEventListener("click", async () => {
  const meals = await getMealsBySearch($("#search-term").value);
  $("#meals").innerHTML = "";
  if (meals) meals.forEach((meal) => addMeal(meal));
});

$("#close-popup").onclick = () => $("#meal-popup").classList.add("hidden");
