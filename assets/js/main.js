const BASE__URL = `https://ecommercebackend.fundamentos-29.repl.co/`;

function updateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

async function getProducts() {
    try {
        const data = await fetch( BASE__URL);
        const res = await data.json();

        updateLocalStorage(`products`, res) 
        return res;
    } catch (error) {
        console.error(error);
    }
}

function printProducts(db) {
    let html = ``;
    db.products.forEach(({category, image, name, price, quantity, id}) => {
        html += `
            <div class="product ${category}">
                <div class="product__image">
                    <img src="${image}" alt="${name}">
                </div>
                <div class="product__body">
                    <p>
                    <b>$${price}.00</b>  <small class="${quantity ? ``:`soldOut`}">
                    ${quantity? `Stock: ${quantity}` :`Sold out`}</small>
                    </p>
                    ${quantity ? `<i class='bx bx-plus' id="${id}"></i>` : `<div></div>`}
                    <h4 class="toModal" id="${id}">${name}</h4>
                </div>
            </div>
        `;
    });

    document.querySelector(`.products`).innerHTML = html;
}

function handleMixitup() {
    mixitup(".products", {
        selectors: {
            target: '.product'
        },
        animation: {
            duration: 300
        }
    });
}

function printProductsCart(db) {
    
    let html = ``;

            Object.values(db.cart).forEach((item)=>{
                html += `
                    <div class="cart__item">
                        <div class="cart__item--img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart__item--info">
                            <h4>${item.name}</h4>
                            <p><small>Stock: ${item.quantity} | <span>$${item.price}.00</span></small></p>
                            <p><span>Subtotal: $${item.price * item.amount}.00</span></p>
                            <div class="cart__item--stock" data-id = "${item.id}">
                                <i class='bx bx-minus'></i>
                                <span>${item.amount} units</span>
                                <i class='bx bx-plus'></i>
                                <i class='bx bx-trash-alt' ></i>
                            </div>
                        </div>
                        
                    </div>
                `;
            });

            document.querySelector(`.cart__products`).innerHTML = html;
}

function handleShowMenu() {
    const iconMenuHTML = document.querySelector(`#iconMenu`); 
    const homeMenuHTML = document.querySelector(`#homeMenu`); 
    const productsMenuHTML = document.querySelector(`#productsMenu`); 
    const menuHTML = document.querySelector(`.menu`); 


    iconMenuHTML.addEventListener(`click`, ()=>{
        menuHTML.classList.toggle(`menu__show`);
    } )
    homeMenuHTML.addEventListener(`click`, ()=>{
        menuHTML.classList.remove(`menu__show`);
    } )
    productsMenuHTML.addEventListener(`click`, ()=>{
        menuHTML.classList.remove(`menu__show`);
    } )
}

function headerShow() {

    let y = window.scrollY;

    if (y > 50) {
        document.querySelector(`.header`).classList.add(`header__show`);
    } else {
        document.querySelector(`.header`).classList.remove(`header__show`);
    }

    window.onscroll = ()=> headerShow();
}

function handleShowCart() {
    const iconCartHTML = document.querySelector(`#iconCart`); 
    const cartHTML = document.querySelector(`.cart`); 

    iconCartHTML.addEventListener(`click`, ()=>{
        cartHTML.classList.toggle(`cart__show`);
    } )
}

function addCartFromProducts(db) {
    const productsHTML =document.querySelector(`.products`);

    productsHTML.addEventListener(`click`, (e) => {

        if (e.target.classList.contains(`bx-plus`)){
            const productId = Number(e.target.id);

            const productFind = db.products.find((product)=>{
                return product.id === productId;
            });

            if (db.cart[productId]){
                if(db.cart[productId].amount === db.cart[productId].quantity) return alert(`Ya no tenemos mas disponibilidad`);
                db.cart[productId].amount += 1;
            } else {
                db.cart[productId] = structuredClone(productFind);
                db.cart[productId].amount = 1;
            } 

            updateLocalStorage(`cart`, db.cart);
            printTotal(db)
            printProductsCart(db)

        }
    });
}

function printTotal(db) {

    const amountItemsHTML= document.querySelector(`#amountItems`);
    const cartTotalInfoHTML = document.querySelector(`.cart__total--info`);

    let amountProducts = 0;
    let priceTotal = 0;
    
    Object.values(db.cart).forEach((item) => {
        amountProducts += item.amount;
        priceTotal += item.amount * item.price ;
    });

    let html = `
            <p>
                <small>${amountProducts} items</small>
            </p>
            <p>
                <span id="total">$${priceTotal}.00</span>
            </p>
    `;

    cartTotalInfoHTML.innerHTML = html;
    amountItemsHTML.textContent = amountProducts;
}

function handleCart(db) {
    const cartProductskHTML =document.querySelector(`.cart__products`);

    cartProductskHTML.addEventListener(`click`,(e) =>{
        if (e.target.classList.contains(`bx-minus`)){
            const productId = Number(e.target.parentElement.dataset.id);

            if(db.cart[productId].amount === 1) {
                const response = confirm(`¿Seguro que desea eliminar este producto?`);
                if (!response) return;
                delete db.cart[productId];
                
            } else{
                db.cart[productId].amount -= 1;
            } 

        }
        if (e.target.classList.contains(`bx-plus`)){
            const productId = Number(e.target.parentElement.dataset.id);
            
            if(db.cart[productId].amount === db.cart[productId].quantity) return alert(`Ya no tenemos mas disponibilidad`);
            db.cart[productId].amount += 1;
        }
        if (e.target.classList.contains(`bx-trash-alt`)){
            const productId = Number(e.target.parentElement.dataset.id);
            const response = confirm(`¿Seguro que desea eliminar este producto?`);
            if (!response) return;
            delete db.cart[productId];
        }
        
        printProductsCart(db);
        updateLocalStorage(`cart`, db.cart);
        printTotal(db);
    });
}

function handleBuy(db) {
    document.querySelector(`#btn__buy`).addEventListener(`click`, ()=> {
        if(!Object.values(db.cart).length) return alert(`Por favor ingrese un artículo en el carrito de compras`);

        const newProducts =[];
        for (const product of db.products) {
            const productCart = db.cart[product.id];

            if (product.id === productCart?.id) {
                newProducts.push({
                    ...product,
                    quantity: product.quantity - productCart.amount,
                });
            } else {
                newProducts.push(product);
            }
        }

        db.products = newProducts;
        db.cart = {}

        updateLocalStorage(`products`, db.products);
        updateLocalStorage(`cart`, db.cart);

        printProducts(db);
        printProductsCart(db);
        printTotal(db);
    });
}

function handleDarkMode() {
    const iconThemeHTML = document.querySelector(".iconTheme");

    if (JSON.parse(localStorage.getItem("darkTheme"))) {
        addDarkTheme();
    }

    iconThemeHTML.addEventListener("click", () => {
        if (document.body.classList.contains("darktheme")) {
            localStorage.setItem("darkTheme", false);
            removeDarkTheme();
        } else {
            localStorage.setItem("darkTheme", true);
            addDarkTheme();
        }
    });

    function removeDarkTheme() {
        document.body.classList.remove("darktheme");
    }
    
    function addDarkTheme() {
        document.body.classList.add("darktheme");
    }
}

function printModal(db){
    
    const productsHTML = document.querySelector(`.products`)

    productsHTML.addEventListener(`click`,(e)=>{
        if (e.target.classList.contains(`toModal`)){
            const productId = Number(e.target.id);
            const productFound = db.products.find((product)=>{
                return product.id === productId;
            });

            const modalProductHTML = document.querySelector(`.modalProduct`)

            console.log(productFound);
            let html =``;

                html += `
                <div class="modalProduct__info">
                    
                    <div class="modal__image">
                    <i class='bx bx-x'></i>
                        <img src="${productFound.image}" alt="${productFound.name}">
                    </div>
                    <div class="modal__body">
                        <h4>${productFound.name}</h4>
                        <p>${productFound.description}</p>
                        <div>
                            <p><b>$${productFound.price}.00</b></p>
                            <p><i class='bx bx-plus' id="${productFound.id}"></i></p>  
                            <p><small>Stock: ${productFound.quantity}</small></p>
                        </div>
                    </div>
                </div>
            `;
            
            modalProductHTML.innerHTML = html;

            const openModalHTML = document.querySelector(`.toModal`);
            const showmodalProductHTML = document.querySelector(`.modalProduct`);
            const cModalHTML = document.querySelector(`.bx-x`);

            openModalHTML.addEventListener(`click`, (e)=>{
                e.preventDefault();
                showmodalProductHTML.classList.add(`modalProduct__show`);
            });

            cModalHTML.addEventListener(`click`, (e)=>{
                e.preventDefault();
                showmodalProductHTML.classList.remove(`modalProduct__show`);
            });
    
        }
        
    });

}

function setLoading() {
    window.addEventListener(`load`,()=>{
        setTimeout(()=> {
            const contentLoadingHTML = document.querySelector(`.contentLoading`);
            contentLoadingHTML.classList.add(`contentLoading__none`);
        },1000)
    })
}

async function main() {
    const db = {
        products: JSON.parse(localStorage.getItem(`products`)) || await getProducts(),
        cart: JSON.parse(localStorage.getItem(`cart`)) ||{},
    };
    
    printProducts(db); 
    handleMixitup();
    handleShowMenu();
    headerShow();
    handleShowCart();
    printProductsCart(db);
    addCartFromProducts(db);
    handleCart(db);
    printTotal(db);
    handleBuy(db); 
    handleDarkMode();
    setLoading();
    printModal(db);

}

main();