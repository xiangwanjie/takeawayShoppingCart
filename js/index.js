// 单件商品的数据
class UIGoods { 
  constructor(g) { 
    this.data = g;
    this.choose = 0;
  }
  // 获取总价
  getTotalPrice() { 
    return this.data.price * this.choose;
  }
  // 是否选中此件商品
  isChoose() { 
    return this.choose > 0;
  }
  // 选择的数量 +1
  increase() { 
    this.choose++;
  }
  // 选择的数量 -1
  decrease() { 
    if (this.choose === 0) { 
      return;
    }
    this.choose--;
  }
}

// 整个见面的数据
class UIData { 
  constructor() { 
    this.uiGoods = goods.map(item => new UIGoods(item));
    this.deliveryThreshold = 30;
    this.deliveryPrice = 5;
  }
  // 得到选中所有商品的总价
  getTotalPrice() { 
    return this.uiGoods.reduce((total, item) => total + item.getTotalPrice(), 0);
  }
  // 增加某件商品的数量
  increase(index) { 
    this.uiGoods[index].increase();
  }
  // 减少某件商品的数量
  decrease(index) { 
    this.uiGoods[index].decrease();
  }
  // 得到总共的选择数量
  getTotalChooseNumber() { 
    return this.uiGoods.reduce((total, item) => total + item.choose, 0)
  }
  // 购物车中是否有东西
  hasGoodsIncar() { 
    return this.getTotalChooseNumber() > 0;
  }
  // 是否跨过了起送标准
  isCrossDeliveryThreshold() { 
    return this.getTotalPrice() >= this.deliveryThreshold;
  }
  // 是否选中
  isChoose(index) { 
    return this.uiGoods[index].isChoose()
  }
}

// UI界面
class UI { 
  constructor() {
    this.uiData = new UIData();
    this.doms = {
      goodsContainer: document.querySelector('.goods-list'),
      deliveryPrice: document.querySelector('.footer-car-tip'),
      footerPay: document.querySelector('.footer-pay'),
      footerPayInnerSpan: document.querySelector('.footer-pay span'),
      totalPrice: document.querySelector('.footer-car-total'),
      car: document.querySelector('.footer-car'),
      badge: document.querySelector('.footer-car-badge'),
    }
    const carRect = this.doms.car.getBoundingClientRect()
    this.jumpTarget = {
      x: carRect.left + carRect.width / 2,
      y: carRect.top + carRect.height / 5
    }
    this.createHTML();
    this.listenEvent();
  }
  // 监听各种事件
  listenEvent() { 
    this.doms.car.addEventListener('animationend', function () { 
     this.classList.remove('animate') 
    })
  }
  // 根据商品数据创建商品列表元素
  createHTML() { 
    let html = '';
    this.uiData.uiGoods.forEach((g, index) => {
      html += `<div class="goods-item">
      <img src="${g.data.pic}" alt="" class="goods-pic" />
      <div class="goods-info">
        <h2 class="goods-title">${g.data.title}</h2>
        <p class="goods-desc">${g.data.desc}</p>
        <p class="goods-sell">
          <span>月售 ${g.data.sellNumber}</span>
          <span>好评率${g.data.favorRate}%</span>
        </p>
        <div class="goods-confirm">
          <p class="goods-price">
            <span class="goods-price-unit">￥</span>
            <span>${g.data.price}</span>
          </p>
          <div class="goods-btns">
            <i data-index="${index}" class="iconfont i-jianhao"></i>
            <span>${g.data.choose}</span>
            <i data-index="${index}" class="iconfont i-jiajianzujianjiahao"></i>
          </div>
        </div>
      </div>
    </div>`;
    });
    this.doms.goodsContainer.innerHTML = html;
  }
  increase(index) { 
    this.uiData.increase(index);
    this.updateGoodsItem(index);
    this.updateFooter();
    this.jump(index);
  }
  decrease(index) { 
    this.uiData.decrease(index);
    this.updateGoodsItem(index);
    this.updateFooter();
  }
  // 更新某个商品元素的显示状态
  updateGoodsItem(index) {
    const goodsDom = this.doms.goodsContainer.children[index];
    if (this.uiData.isChoose(index)) {
      goodsDom.classList.add('active');
    } else { 
      goodsDom.classList.remove('active');
    }
    const span = goodsDom.querySelector('.goods-btns span');
    span.textContent = this.uiData.uiGoods[index].choose;
  }
  // 更新页脚
  updateFooter() { 
    // 得到总价数据
    const total = this.uiData.getTotalPrice();
    // 设置配送费
    this.doms.deliveryPrice.textContent = `配送费￥${this.uiData.deliveryPrice}`;
    // 设置起送费还差多少
    if (this.uiData.isCrossDeliveryThreshold()) {
      // 到达起送点
      this.doms.footerPay.classList.add('active');
    } else { 
      this.doms.footerPay.classList.remove('active');
      // 更新还差多少钱
      const dis = Math.round(this.uiData.deliveryThreshold - total);
      this.doms.footerPayInnerSpan.textContent = `还差￥${dis}元起送`
    }
    // 设置总价
    this.doms.totalPrice.textContent = total.toFixed(2);
    // 设置购物车的样式状态
    if (this.uiData.hasGoodsIncar()) {
      this.doms.car.classList.add('active');
    }else{ 
      this.doms.car.classList.remove('active');
    }
    // 设置购物车中的数量
    this.doms.badge.textContent = this.uiData.getTotalChooseNumber();
  }
  // 购物车动画
  carAnimate() { 
    this.doms.car.classList.add('animate');
  }
  // 抛物线跳跃动的元素
  jump(index) { 
    // 找到对应商品的加号
    const btnAdd = this.doms.goodsContainer.children[index].querySelector('.i-jiajianzujianjiahao');
    const rect = btnAdd.getBoundingClientRect();
    const start = {
      x: rect.left,
      y: rect.top,
    };
    // 跳
    const div = document.createElement('div');
    div.className = 'add-to-car';
    const i = document.createElement('i');
    i.className = 'iconfont i-jiajianzujianjiahao';
    // 设置初始位置
    div.style.transform = `translateX(${start.x}px)`;
    i.style.transform = `translateY(${start.y}px)`;
    div.appendChild(i);
    document.body.appendChild(div);
    // 强渲染
    div.clientWidth;

    // 设置结束位置
    div.style.transform = `translateX(${this.jumpTarget.x}px)`;
    i.style.transform = `translateY(${this.jumpTarget.y}px)`;
    div.addEventListener('transitionend', () => { 
      div.remove();
      this.carAnimate();
    }, { once: true}) // once 事件只执行一次
  }
}

var ui = new UI();

// 绑定事件
ui.doms.goodsContainer.addEventListener('click', function (e) { 
  if (e.target.classList.contains('i-jiajianzujianjiahao')) { 
    const index = +e.target.dataset.index;
    ui.increase(index);
  } else if(e.target.classList.contains('i-jianhao')) {
    const index = +e.target.dataset.index;
    ui.decrease(index);
  }
})
