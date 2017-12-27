Vue.component('counter', {
  props: {
    curAmt: Number,
    index: Number,
    id: String
  },
  template: '<div class="quantity"><button class="plus-btn ti-plus" type="button" @click="increaseCounter(100)"/><input type="text" class="counterInput" v-model.lazy="counter" v-bind:value="counter"><button class="minus-btn ti-minus" type="button" @click="decreaseCounter(0)"/></div>',

  data: function() {
    return {
      counter: 0
    }
  },
  methods: {
    increaseCounter(increaseLimit) {
      // if (this.counter < increaseLimit)
        this.counter++;
    },
    decreaseCounter(decreaseLimit) {
      if (this.counter > decreaseLimit)
        this.counter--;
    }
  },
  created() {
    this.counter = this.curAmt;
  },
  watch: {
    counter: function (){
      if (this.$parent.page == 'basket' && this.counter != this.$parent.basket[this.index].quantity.value) {
        this.$parent.changeBasketItem(this.id, this.counter, this.index)
      }
    }
  }
});
