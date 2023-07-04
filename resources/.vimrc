set nocompatible              " be iMproved, required
filetype off                  " required
set ts=4
set expandtab

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
" call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'gmarik/Vundle.vim'
"
Plugin 'tpope/vim-fugitive'

Plugin 'djoshea/vim-matlab'
" Plugin 'djoshea/vim-matlab-fold'
map <C-F12> :!ctags -R --c++-kinds=+p --fields=+iaS --extra=+q .<CR>

Bundle 'scrooloose/syntastic'
let g:syntastic_error_symbol='12'
let g:syntastic_warning_symbol='34'
let g:syntastic_check_on_open=1
let g:syntastic_enable_highlighting =1
let g:syntastic_python_checkers=['flake8']
let g:Syntastic_enable_balloons =1
highlight SyntasticErrorSign guifg=black guibg=green

Plugin 'andviro/flake8-vim'
let g:PyFlakeOnWrite = 1
let g:PyFlakeCheckers = "pep8,frosted,pyflakes"
" let g:PyFlakeCheckers = "pep8,frosted"
let g:PyFlakeCWindow = 6
let g:PyFlakeMaxLineLength = 100
let g:PyFlakeRangeCommand = 'Q'
let g:PyFlakeDisabledMessages = 'E501,E111,E114'
let g:syntastic_python_flake8_args='--ignore=F821,E302,E501,E114'

Plugin 'L9'
" Git plugin not hosted on GitHub
" git repos on your local machine (i.e. when working on your own plugin)
" The sparkup vim script is in a subdirectory of this repo called vim.
" Pass the path to set the runtimepath properly.
Plugin 'rstacruz/sparkup', {'rtp': 'vim/'}
" Avoid a name conflict with L9
" Plugin 'user/L9', {'name': 'newL9'}
Bundle 'Valloric/ListToggle'
Bundle 'Valloric/YouCompleteMe'
let g:ycm_server_keep_logfiles = 1
let g:ycm_server_log_level = 'debug'
let g:ycm_path_to_python_interpreter = '/usr/bin/python'
let g:ycm_complete_in_comments = 0
let c_space_errors = 0

Plugin 'davidhalter/jedi-vim'
Plugin 'crucerucalin/peaksea.vim'
Plugin 'tpope/vim-vividchalk'
Plugin 'jpo/vim-railscasts-theme'
Plugin 'scrooloose/nerdTree'
Plugin 'JamshedVesuna/vim-markdown-preview'

filetype plugin indent on
" required
"if ycm_add_preview_to_completeopt = 0 can't work then set cot
" set completeopt = "menuone"
" All of your Plugins must be added before the following line
call vundle#end()            " required
" To ignore plugin indent changes, instead use:
"filetype plugin on
"
" Brief help
" :PluginList       - lists configured plugins
" :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
" :PluginSearch foo - searches for foo; append `!` to refresh local cache
" :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
"
" see :h vundle for more details or wiki for FAQ
" Put your non-Plugin stuff after this line
set sw=4
set ts=4
set autoindent
set nu!
syntax on
 
set ruler
set showcmd
set hlsearch
set background=dark
autocmd FileType python set tabstop=4 shiftwidth=4 expandtab ai
colorscheme railscasts
