/**
 * Service for managing starter code templates
 */
class StarterCodeService {
  constructor() {
    this.baseURL = '/starter_code'
  }

  /**
   * Get available starter code types
   */
  getStarterCodeTypes() {
    return [
      { value: 'two_int_to_int', label: 'Two Integers → Integer' },
      { value: 'three_int_to_int', label: 'Three Integers → Integer' },
      { value: 'string_to_string', label: 'String → String' },
      { value: 'int_array_to_int', label: 'Integer Array → Integer' },
      { value: 'string_array_to_string', label: 'String Array → String' },
      { value: 'mixed_to_string', label: 'Mixed (Int, String) → String' },
      { value: 'single_argument', label: 'Single Argument → String' }
    ]
  }

  /**
   * Get starter code for a specific language and type
   * @param {string} language - Programming language
   * @param {string} type - Starter code type
   * @returns {Promise<string>} Starter code content
   */
  async getStarterCode(language, type) {
    try {
      const response = await fetch(`${this.baseURL}/${language}/${type}.txt`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch starter code: ${response.status}`)
      }

      const content = await response.text()
      return content || ''
    } catch (error) {
      console.error('Error fetching starter code:', error)
      return this.getFallbackStarterCode(language, type)
    }
  }

  /**
   * Fallback starter code if API fails
   */
  getFallbackStarterCode(language, type) {
    const fallbacks = {
      python: {
        two_int_to_int: 'def solution(a, b):\n    ',
        three_int_to_int: 'def solution(a, b, c):\n    ',
        string_to_string: 'def solution(word):\n    ',
        int_array_to_int: 'def solution(nums):\n    ',
        string_array_to_string: 'def solution(words):\n    ',
        mixed_to_string: 'def solution(n, word):\n    ',
        single_argument: 'def solution(word):\n    '
      },
      java: {
        two_int_to_int: 'public class Solution {\n    public int solution(int a, int b) {\n        \n    }\n}',
        three_int_to_int: 'public class Solution {\n    public int solution(int a, int b, int c) {\n        \n    }\n}',
        string_to_string: 'public class Solution {\n    public String solution(String word) {\n        \n    }\n}',
        int_array_to_int: 'public class Solution {\n    public int solution(int[] nums) {\n        \n    }\n}',
        string_array_to_string: 'public class Solution {\n    public String solution(String[] words) {\n        \n    }\n}',
        mixed_to_string: 'public class Solution {\n    public String solution(int n, String word) {\n        \n    }\n}',
        single_argument: 'public class Solution {\n    public String solution(String word) {\n        \n    }\n}'
      },
      cpp: {
        two_int_to_int: 'int solution(int a, int b) {\n    \n}',
        three_int_to_int: 'int solution(int a, int b, int c) {\n    \n}',
        string_to_string: '#include <string>\nusing namespace std;\n\nstring solution(string word) {\n    \n}',
        int_array_to_int: '#include <vector>\nusing namespace std;\n\nint solution(vector<int>& nums) {\n    \n}',
        string_array_to_string: '#include <vector>\n#include <string>\nusing namespace std;\n\nstring solution(vector<string>& words) {\n    \n}',
        mixed_to_string: '#include <string>\nusing namespace std;\n\nstring solution(int n, string word) {\n    \n}',
        single_argument: '#include <string>\nusing namespace std;\n\nstring solution(string word) {\n    \n}'
      }
    }

    return fallbacks[language]?.[type] || `// No starter code available for ${language} ${type}`
  }
}

// Export singleton instance
const starterCodeService = new StarterCodeService()
export default starterCodeService
