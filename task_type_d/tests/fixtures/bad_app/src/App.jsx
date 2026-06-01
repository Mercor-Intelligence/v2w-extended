// Deliberately bad Task Type D candidate, used only to prove the rubric
// analyzers discriminate. It violates several must-have items on purpose:
//   2.1 no Zustand store        2.2 single file over 150 lines
//   2.3 almost no Tailwind      2.4 inline styles
//   2.5 imports MUI             2.6 shared collection in local useState
//   2.7 conditional hook        3.2 no semantic button/input/label
//   3.3 clickable div           3.1 no empty state
import React, { useState } from 'react'
import { Button } from '@mui/material'

export default function App() {
  const [items, setItems] = useState([])
  const ready = items.length >= 0
  // 2.7: a hook called inside a conditional block (rules-of-hooks violation).
  if (ready) {
    const [n, setN] = useState(0)
    setN(n)
  }

  function add() {
    setItems([...items, { id: items.length, label: 'row ' + items.length }])
  }

  // 2.4: inline styles instead of Tailwind utility classes.
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 24, fontWeight: 700 }}>Expense Tracker (bad)</div>
      {/* 3.3: a clickable div instead of a real button. */}
      <div onClick={add} style={{ cursor: 'pointer', color: 'blue' }}>Add expense</div>
      <Button>noop</Button>
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 100 }}>Description</div>
          <div style={{ width: 100 }}>Amount</div>
          <div style={{ width: 100 }}>Category</div>
        </div>
        <div>row 0</div>
        <div>row 1</div>
        <div>row 2</div>
        <div>row 3</div>
        <div>row 4</div>
        <div>row 5</div>
        <div>row 6</div>
        <div>row 7</div>
        <div>row 8</div>
        <div>row 9</div>
        <div>row 10</div>
        <div>row 11</div>
        <div>row 12</div>
        <div>row 13</div>
        <div>row 14</div>
        <div>row 15</div>
        <div>row 16</div>
        <div>row 17</div>
        <div>row 18</div>
        <div>row 19</div>
        <div>row 20</div>
        <div>row 21</div>
        <div>row 22</div>
        <div>row 23</div>
        <div>row 24</div>
        <div>row 25</div>
        <div>row 26</div>
        <div>row 27</div>
        <div>row 28</div>
        <div>row 29</div>
        <div>row 30</div>
        <div>row 31</div>
        <div>row 32</div>
        <div>row 33</div>
        <div>row 34</div>
        <div>row 35</div>
        <div>row 36</div>
        <div>row 37</div>
        <div>row 38</div>
        <div>row 39</div>
        <div>row 40</div>
        <div>row 41</div>
        <div>row 42</div>
        <div>row 43</div>
        <div>row 44</div>
        <div>row 45</div>
        <div>row 46</div>
        <div>row 47</div>
        <div>row 48</div>
        <div>row 49</div>
        <div>row 50</div>
        <div>row 51</div>
        <div>row 52</div>
        <div>row 53</div>
        <div>row 54</div>
        <div>row 55</div>
        <div>row 56</div>
        <div>row 57</div>
        <div>row 58</div>
        <div>row 59</div>
        <div>row 60</div>
        <div>row 61</div>
        <div>row 62</div>
        <div>row 63</div>
        <div>row 64</div>
        <div>row 65</div>
        <div>row 66</div>
        <div>row 67</div>
        <div>row 68</div>
        <div>row 69</div>
        <div>row 70</div>
        <div>row 71</div>
        <div>row 72</div>
        <div>row 73</div>
        <div>row 74</div>
        <div>row 75</div>
        <div>row 76</div>
        <div>row 77</div>
        <div>row 78</div>
        <div>row 79</div>
        <div>row 80</div>
        <div>row 81</div>
        <div>row 82</div>
        <div>row 83</div>
        <div>row 84</div>
        <div>row 85</div>
        <div>row 86</div>
        <div>row 87</div>
        <div>row 88</div>
        <div>row 89</div>
        <div>row 90</div>
        <div>row 91</div>
        <div>row 92</div>
        <div>row 93</div>
        <div>row 94</div>
        <div>row 95</div>
        <div>row 96</div>
        <div>row 97</div>
        <div>row 98</div>
        <div>row 99</div>
        <div>row 100</div>
        <div>row 101</div>
        <div>row 102</div>
        <div>row 103</div>
        <div>row 104</div>
        <div>row 105</div>
        <div>row 106</div>
        <div>row 107</div>
        <div>row 108</div>
        <div>row 109</div>
        <div>row 110</div>
        <div>row 111</div>
        <div>row 112</div>
        <div>row 113</div>
        <div>row 114</div>
        <div>row 115</div>
        <div>row 116</div>
        <div>row 117</div>
        <div>row 118</div>
        <div>row 119</div>
      </div>
    </div>
  )
}
