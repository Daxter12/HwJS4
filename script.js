const API_URL =
  'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses'

class GoodsList {
  constructor(cart, container = '.goods-list') {
    this.container = container
    this.goods = []
    this.cart = cart
    this.filtered = []
    document.querySelector(this.container).addEventListener('click', (e) => {
      if (e.target.classList.contains('buy-btn')) {
        this.cart.addItem(e.target)
      }
    })
    document.querySelector('.search-form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.filter(document.querySelector('.search-field').value)
    })
  }
  fetchGoods(url = `${API_URL}/catalogData.json`) {
    return new Promise((resolve, reject) => {
      const promise = makeGETRequest(url)
      promise.then((goods) => {
        this.goods = [...JSON.parse(goods)]
        resolve()
      })
    })
  }
  render() {
    let listHtml = ''
    this.goods.forEach((good) => {
      const goodItem = new GoodsItem(
        good.product_name,
        good.price,
        good.id_product
      )

      listHtml += goodItem.render()
    })
    document.querySelector('.goods-list').innerHTML = listHtml
  }
  filter(value) {
    const regexp = new RegExp(value, 'i')
    this.filtered = this.goods.filter((product) =>
      regexp.test(product.product_name)
    )
    this.goods.forEach((el) => {
      const block = document.querySelector(
        `.goods-item[data-id="${el.id_product}"]`
      )
      if (!this.filtered.includes(el)) {
        block.classList.add('invisible')
      } else {
        block.classList.remove('invisible')
      }
    })
  }
}

class GoodsItem {
  constructor(title, price, id_product, img = 'https://placehold.it/200x150') {
    this.title = title
    this.price = price
    this.id_product = id_product
    this.img = img
  }
  render() {
    return `<div class="goods-item" data-id="${this.id_product}">
              <div class="img-wrap">
                <img src="${this.img}" alt="">
              </div>
              <h3>${this.title}</h3>
              <p>${this.price}</p>
              <button class="buy-btn" data-id="${this.id_product}" data-name="${this.title}" data-price="${this.price}" type="button">Купить</button>
            </div>`
  }
}

class Cart {
  constructor() {
    this.goodsList = []
    document.querySelector('.cart-button').addEventListener('click', () => {
      document.querySelector('.cart-block').classList.toggle('invisible')
    })
    document.querySelector('.cart-block').addEventListener('click', (e) => {
      if (e.target.classList.contains('del-btn')) {
        this.removeItem(e.target)
      } else if (e.target.classList.contains('rm-btn')) {
        this.clearCart()
      }
    })
    // const promise = makeGETRequest(`${API_URL}/getBasket.json`)
    // promise.then((goods) => {
    //   this.goodsList = JSON.parse(goods).contents
    //   this.render()
    // })
  }
  render() {
    let html = ''
    for (let product of this.goodsList) {
      const productObj = new CartItem(product)
      html += productObj.render()
    }
    if (this.goodsList.length > 0) {
      html += `<hr>`
      html += `<div class='btn-cart-buy'>`
      html += `<button class='buy-btn by-btn'>Купить</button>`
      html += `<button class='buy-btn rm-btn'>Очистить</button>`
      html += `</div>`
    }
    document.querySelector('.cart-block').innerHTML = html
  }

  addItem(element) {
    const promise = makeGETRequest(`${API_URL}/addToBasket.json`)
    promise.then((goods) => {
      let ans = JSON.parse(goods)
      if (ans.result === 1) {
        let productId = +element.dataset['id']
        let find = this.goodsList.find(
          (product) => product.id_product === productId
        )
        if (find) {
          find.quantity++
        } else {
          let product = {
            id_product: productId,
            price: +element.dataset['price'],
            product_name: element.dataset['name'],
            quantity: 1,
          }
          this.goodsList.push(product)
        }
        this.render()
      } else {
        alert('Error')
      }
    })
  }
  removeItem(element) {
    const promise = makeGETRequest(`${API_URL}/deleteFromBasket.json`)
    promise.then((goods) => {
      let ans = JSON.parse(goods)
      if (ans.result === 1) {
        let productId = +element.dataset['id']
        let find = this.goodsList.find(
          (product) => product.id_product === productId
        )
        if (find.quantity > 1) {
          find.quantity--
        } else {
          this.goodsList.splice(this.goodsList.indexOf(find), 1)
          document.querySelector(`.cart-item[data-id="${productId}"]`).remove()
        }
        this.render()
      } else {
        alert('Error')
      }
    })
  }
  clearCart() {
    this.goodsList = []
    this.render()
  }
}

class CartItem {
  constructor(el) {
    this.id_product = el.id_product
    this.price = el.price
    this.product_name = el.product_name
    this.quantity = el.quantity
  }
  render() {
    return `<div class="cart-item" data-id="${this.id_product}">
            <div class="product-bio">
            <img src="${this.img}" alt="Some image">
            <div class="product-desc">
            <p class="product-title">${this.product_name}</p>
            <p class="product-quantity">Quantity: ${this.quantity}</p>
        <p class="product-single-price">$${this.price} each</p>
        </div>
        </div>
        <div class="right-block">
            <p class="product-price">$${this.quantity * this.price}</p>
            <button class="del-btn" data-id="${
              this.id_product
            }">&times;</button>
        </div>
        </div>`
  }
}

function makeGETRequest(url) {
  return new Promise((resolve, reject) => {
    let xhr
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest()
    } else if (window.ActiveXObject) {
      xhr = new ActiveXObject('Microsoft.XMLHTTP')
    }
    // установить функцию на событие по изменению состоянию готовности
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve(xhr.responseText)
      }
    }
    xhr.open('GET', url, true)
    xhr.send()
  })
}

const cart = new Cart()

const list = new GoodsList(cart)
list.fetchGoods().then(() => {
  list.render()
  console.log(1)
})
list.fetchGoods('getProducts.json').then(() => {
  list.render()
  console.log(2)
})
