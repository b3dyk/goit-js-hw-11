import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';

class ImageSearch {
  constructor({ form, searchBtn, gallery }, URI) {
    this.form = form;
    this.searchBtn = searchBtn;
    this.gallery = gallery;
    this.URI = URI;
    this.pageCounter = 1;
    this.searchValue = 'cat';
  }

  init() {
    this.addListeners();
  }

  addListeners() {
    this.form.addEventListener('submit', this.onSubmit.bind(this));
    window.addEventListener('scroll', this.endlessScroll.bind(this));
  }

  onSubmit(evt) {
    evt.preventDefault();

    this.searchValue = evt.target.elements.searchQuery.value;

    if (this.searchValue === '') {
      Notify.failure('Please clarify your search');
      return;
    }

    this.gallery.innerHTML = '';
    this.pageCounter = 1;
    this.getImages();
  }

  getImages() {
    const query = `&q=${this.searchValue}`;
    const URI = this.URI + this.pageCounter + query;

    axios
      .get(URI)
      .then(this.handleRes.bind(this))
      .catch(this.handleError.bind(this));
  }

  handleRes(res) {
    if (res.data.total === 0) {
      throw new Error('No matches found');
    }
    this.renderCards(res.data.hits);

    Notify.success(`Hooray! We found ${res.data.totalHits} images.`);

    new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
  }

  handleError(err) {
    console.log(err);
    console.log(err.response);
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  renderCards(imagesArr) {
    const markup = imagesArr
      .map(
        ({
          webformatURL,
          downloads,
          likes,
          views,
          comments,
          largeImageURL,
          tags,
        }) =>
          `<div class="photo-card"><a class="photo-card__link" href=${largeImageURL}>
      <img class="photo-card__image" src="${webformatURL}" alt="${tags}" loading="lazy" width="375"  /></a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
            ${likes}
        </p>
        <p class="info-item">
          <b>Views</b>
          ${views}
        </p>
        <p class="info-item">
          <b>Comments</b>
          ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>
          ${downloads}
        </p>
      </div>
    </div>`
      )
      .join('');

    this.gallery.innerHTML += markup;
  }

  endlessScroll() {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

    if (clientHeight + scrollTop === scrollHeight) {
      this.pageCounter += 1;
      this.getImages();
    }
  }
}

const URI =
  'https://pixabay.com/api/?key=31237471-5a493734838c09426069ada78&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=';

const refs = {
  form: document.querySelector('#search-form'),
  searchBtn: document.querySelector('button[type="submit"]'),
  gallery: document.querySelector('.gallery'),
};

new ImageSearch(refs, URI).init();
