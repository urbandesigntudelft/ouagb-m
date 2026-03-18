-- reset-chapter-numbers.lua
-- This Lua filter resets chapter numbering at the beginning of each part
-- It works for both HTML and PDF outputs in Quarto books

-- Track the current part and chapter number
local current_part = nil           -- Stores the current part's identifier
local chapter_counter = 0          -- Counter for chapters within current part
local is_first_chapter_after_part = false  -- Flag to detect first chapter after a part

-- Function to process document structure
-- This runs at the start of document processing
function Pandoc(doc)
    -- Initialize/reset variables at the beginning of each document
    current_part = nil
    chapter_counter = 0
    is_first_chapter_after_part = false
    
    -- Return the document unchanged (we only need the state variables)
    return doc
end

-- Function to process Div elements (containers)
-- Parts in Quarto books are represented as Div elements with class 'section'
function Div(el)
    -- Check if this Div represents a part (has 'section' class and contains a level-1 heading)
    if el.classes:includes('section') then
        -- Look for a level-1 heading inside this Div
        for i, item in ipairs(el.content) do
            if item.t == 'Header' and item.level == 1 then
                -- Found a new part!
                -- Reset the chapter counter for this new part
                chapter_counter = 0
                current_part = item -- Store the part heading
                
                -- Set flag to indicate next chapter is the first in this part
                is_first_chapter_after_part = true
                
                -- Optional: Add a note in the part heading about chapter reset
                -- Uncomment the following lines if you want to indicate reset in the part title
                -- local part_text = pandoc.utils.stringify(item.content)
                -- item.content = pandoc.Span(part_text .. " (Chapters restart here)")
                
                break
            end
        end
    end
    return el
end

-- Function to process Header elements (headings)
-- Chapters are typically level-2 headings in Quarto books
function Header(el)
    -- Only process level-2 headings (assumed to be chapters)
    if el.level == 2 then
        -- Check if this is the first chapter after a part
        if is_first_chapter_after_part then
            -- Reset chapter counter to 1 (first chapter of the part)
            chapter_counter = 1
            is_first_chapter_after_part = false
        else
            -- Increment chapter counter for subsequent chapters
            chapter_counter = chapter_counter + 1
        end
        
        -- Get the current chapter title as plain text
        local chapter_title = pandoc.utils.stringify(el.content)
        
        -- Create the new numbered title
        -- Format: "Chapter X.Y: Title" where X is part number, Y is chapter number
        -- But since parts might not have numbers, we'll use just the chapter number
        local numbered_title = "Chapter " .. chapter_counter .. ": " .. chapter_title
        
        -- Alternative format: If you want part numbers included, you'd need to track part numbers too
        -- This is more complex as parts don't automatically get numbers
        -- local numbered_title = "Chapter " .. chapter_counter .. ": " .. chapter_title
        
        -- Replace the original content with the numbered title
        -- We need to create a new Span element with the numbered text
        el.content = pandoc.Span(numbered_title)
        
        -- Optional: Add a custom attribute to help with debugging or CSS styling
        el.attributes['data-chapter-number'] = tostring(chapter_counter)
        el.attributes['data-part'] = tostring(current_part)
    end
    
    return el
end

-- Function to process Meta data (document metadata)
-- This can be used to pass configuration from _quarto.yml if needed
function Meta(meta)
    -- You could add configuration options here
    -- For example, allow users to specify heading level for chapters
    -- local chapter_level = meta.chapter_level and meta.chapter_level.c or 2
    return meta
end

-- Debug function (optional) - uncomment to see what's happening
-- function Debug(msg)
--     io.stderr:write("DEBUG: " .. msg .. "\n")
-- end

-- Print a message when the filter loads (visible in terminal during build)
io.stderr:write("INFO: Chapter reset filter loaded - chapters will restart at each part\n")